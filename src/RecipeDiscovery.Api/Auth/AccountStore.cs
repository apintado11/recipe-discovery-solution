using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Options;

namespace RecipeDiscovery.Api.Auth;

public sealed class Account
{
    public string Id { get; set; } = "";

    public string Email { get; set; } = "";

    public string Username { get; set; } = "";

    public string PasswordHash { get; set; } = "";

    public int PasswordVersion { get; set; } = 1;

    public string? ResetTokenHash { get; set; }

    public long? ResetExpiresUnix { get; set; }

    public DemoUser ToPublic()
    {
        return new DemoUser(Id, Username, Email);
    }
}

public sealed class LocalMessage
{
    public string Id { get; set; } = "";

    public string To { get; set; } = "";

    public string Subject { get; set; } = "";

    public string Body { get; set; } = "";

    public string ResetUrl { get; set; } = "";

    public long SentUnix { get; set; }
}

public sealed class RevokedToken
{
    public string Jti { get; set; } = "";

    public long ExpiresUnix { get; set; }
}

public sealed class AccountStore
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        WriteIndented = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        PropertyNameCaseInsensitive = true
    };

    private readonly object _gate = new();
    private readonly bool _persist;
    private readonly string _path;
    private readonly ILogger<AccountStore> _logger;
    private readonly string _dummyHash = PasswordHasher.Hash("not-a-real-password");
    private List<Account> _accounts = [];
    private List<LocalMessage> _messages = [];
    private List<RevokedToken> _revoked = [];
    private int _nextId = 1;

    public AccountStore(IHostEnvironment environment, IOptions<AuthOptions> options, ILogger<AccountStore> logger)
    {
        _logger = logger;
        var settings = options.Value;
        _persist = settings.Persist;
        _path = string.IsNullOrWhiteSpace(settings.StorePath)
            ? System.IO.Path.Combine(environment.ContentRootPath, "data", "accounts.json")
            : settings.StorePath;

        if (_persist && File.Exists(_path))
        {
            try
            {
                Load();
            }
            catch (Exception exception) when (exception is JsonException or IOException)
            {
                _logger.LogWarning(exception, "Could not read {Path}. Starting with the sample kitchens.", _path);
                Seed();
                Save();
            }
        }
        else
        {
            Seed();
            Save();
        }
    }

    public bool UserExists(string userId)
    {
        lock (_gate)
        {
            return _accounts.Any(account => account.Id == userId);
        }
    }

    public bool HasPasswordVersion(string userId, int version)
    {
        lock (_gate)
        {
            var account = _accounts.FirstOrDefault(item => item.Id == userId);
            return account is not null && account.PasswordVersion == version;
        }
    }

    public Authenticated? Authenticate(string email, string password)
    {
        var key = AuthRules.NormalizeEmail(email);
        lock (_gate)
        {
            var account = _accounts.FirstOrDefault(item => item.Email == key);
            if (account is null)
            {
                PasswordHasher.Verify(password, _dummyHash);
                return null;
            }

            if (!PasswordHasher.Verify(password, account.PasswordHash))
            {
                return null;
            }

            return new Authenticated(account.ToPublic(), account.PasswordVersion);
        }
    }

    public Authenticated? Register(string name, string email, string password)
    {
        var key = AuthRules.NormalizeEmail(email);
        var display = name.Trim();
        lock (_gate)
        {
            if (_accounts.Any(account => account.Email == key))
            {
                return null;
            }

            var account = new Account
            {
                Id = _nextId.ToString(),
                Email = key,
                Username = display,
                PasswordHash = PasswordHasher.Hash(password),
                PasswordVersion = 1
            };
            _nextId++;
            _accounts.Add(account);
            Save();
            return new Authenticated(account.ToPublic(), account.PasswordVersion);
        }
    }

    public void BeginReset(string email, string publicAppUrl, bool deliverLocally)
    {
        var key = AuthRules.NormalizeEmail(email);
        lock (_gate)
        {
            var account = _accounts.FirstOrDefault(item => item.Email == key);
            if (account is null)
            {
                return;
            }

            var token = PasswordHasher.NewToken();
            account.ResetTokenHash = PasswordHasher.HashToken(token);
            account.ResetExpiresUnix = DateTimeOffset.UtcNow.AddMinutes(AuthRules.ResetMinutes).ToUnixTimeSeconds();

            if (deliverLocally)
            {
                var url = $"{publicAppUrl.TrimEnd('/')}/reset-password?token={Uri.EscapeDataString(token)}";
                _messages.Insert(0, new LocalMessage
                {
                    Id = Guid.NewGuid().ToString("N"),
                    To = account.Email,
                    Subject = "Reset your password",
                    Body = $"Hi {account.Username}, choose a new password with the link in this message. It lasts {AuthRules.ResetMinutes} minutes. If you didn't ask for a reset, you can ignore it.",
                    ResetUrl = url,
                    SentUnix = DateTimeOffset.UtcNow.ToUnixTimeSeconds()
                });
                _logger.LogInformation("Local password reset for {Email}: {Url}", account.Email, url);
            }

            Save();
        }
    }

    public string? CompleteReset(string token, string password)
    {
        var hash = PasswordHasher.HashToken(token);
        lock (_gate)
        {
            Account? match = null;
            foreach (var account in _accounts)
            {
                if (account.ResetTokenHash is null || account.ResetTokenHash.Length != hash.Length)
                {
                    continue;
                }

                var same = CryptographicOperations.FixedTimeEquals(
                    Encoding.ASCII.GetBytes(account.ResetTokenHash),
                    Encoding.ASCII.GetBytes(hash));
                if (same)
                {
                    match = account;
                    break;
                }
            }

            if (match is null || match.ResetExpiresUnix is null || match.ResetExpiresUnix < DateTimeOffset.UtcNow.ToUnixTimeSeconds())
            {
                return "This reset link has expired or has already been used.";
            }

            match.PasswordHash = PasswordHasher.Hash(password);
            match.PasswordVersion++;
            match.ResetTokenHash = null;
            match.ResetExpiresUnix = null;
            Save();
            return null;
        }
    }

    public IReadOnlyList<LocalMessage> MessagesFor(string email)
    {
        var key = AuthRules.NormalizeEmail(email);
        lock (_gate)
        {
            return _messages.Where(message => message.To == key).OrderByDescending(message => message.SentUnix).Take(5).ToList();
        }
    }

    public bool IsRevoked(string jti)
    {
        lock (_gate)
        {
            var hit = _revoked.FirstOrDefault(item => item.Jti == jti);
            if (hit is null)
            {
                return false;
            }

            if (hit.ExpiresUnix < DateTimeOffset.UtcNow.ToUnixTimeSeconds())
            {
                _revoked.Remove(hit);
                return false;
            }

            return true;
        }
    }

    public void Revoke(string jti, long expiresUnix)
    {
        lock (_gate)
        {
            if (_revoked.All(item => item.Jti != jti))
            {
                _revoked.Add(new RevokedToken { Jti = jti, ExpiresUnix = expiresUnix });
            }

            Save();
        }
    }

    private void Seed()
    {
        _accounts =
        [
            Sample("1", "Alex", "alex@recipe.test"),
            Sample("2", "Blair", "blair@recipe.test"),
            Sample("3", "Casey", "casey@recipe.test")
        ];
        _messages = [];
        _revoked = [];
        _nextId = 4;
    }

    private static Account Sample(string id, string name, string email)
    {
        return new Account
        {
            Id = id,
            Email = email,
            Username = name,
            PasswordHash = PasswordHasher.Hash(AuthRules.DemoPassword),
            PasswordVersion = 1
        };
    }

    private void Load()
    {
        var file = JsonSerializer.Deserialize<AccountFile>(File.ReadAllText(_path), JsonOptions);
        if (file?.Accounts is null || file.Accounts.Count == 0)
        {
            Seed();
            return;
        }

        _accounts = file.Accounts;
        _messages = file.Messages ?? [];
        _revoked = file.Revoked ?? [];
        var now = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        _revoked.RemoveAll(item => item.ExpiresUnix < now);
        _nextId = _accounts.Select(account => int.TryParse(account.Id, out var id) ? id : 0).DefaultIfEmpty(0).Max() + 1;
    }

    private void Save()
    {
        if (!_persist)
        {
            return;
        }

        var now = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        _revoked.RemoveAll(item => item.ExpiresUnix < now);
        if (_messages.Count > 40)
        {
            _messages = _messages.OrderByDescending(message => message.SentUnix).Take(40).ToList();
        }

        var directory = System.IO.Path.GetDirectoryName(_path);
        if (!string.IsNullOrEmpty(directory))
        {
            Directory.CreateDirectory(directory);
        }

        var json = JsonSerializer.Serialize(new AccountFile
        {
            Accounts = _accounts,
            Messages = _messages,
            Revoked = _revoked
        }, JsonOptions);
        var temp = _path + ".tmp";
        File.WriteAllText(temp, json);
        File.Move(temp, _path, overwrite: true);
    }

    private sealed class AccountFile
    {
        public List<Account> Accounts { get; set; } = [];

        public List<LocalMessage> Messages { get; set; } = [];

        public List<RevokedToken> Revoked { get; set; } = [];
    }
}
