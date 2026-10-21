using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace RecipeDiscovery.Api.Auth;

public sealed record IssuedToken(DemoUser User, string Jti, int PasswordVersion, long Expires);

public sealed class DemoTokenService
{
    private readonly byte[] _key;

    public DemoTokenService(IConfiguration configuration)
    {
        var secret = configuration["Auth:SigningKey"];
        if (string.IsNullOrWhiteSpace(secret))
        {
            secret = "recipe-discovery-demo-signing-key";
        }

        _key = Encoding.UTF8.GetBytes(secret);
    }

    public string Create(DemoUser user, int passwordVersion)
    {
        var header = Encode(new { alg = "HS256", typ = "JWT" });
        var jti = Guid.NewGuid().ToString("N");
        var payload = Encode(new
        {
            sub = user.Id,
            username = user.Username,
            email = user.Email,
            ver = passwordVersion,
            jti,
            exp = DateTimeOffset.UtcNow.AddHours(12).ToUnixTimeSeconds()
        });
        return $"{header}.{payload}.{Sign($"{header}.{payload}")}";
    }

    public IssuedToken? Read(string token)
    {
        var parts = token.Split('.');
        if (parts.Length != 3)
        {
            return null;
        }

        byte[] actual;
        byte[] expected;
        try
        {
            actual = Base64UrlDecode(parts[2]);
            expected = Base64UrlDecode(Sign($"{parts[0]}.{parts[1]}"));
        }
        catch (FormatException)
        {
            return null;
        }

        if (actual.Length != expected.Length || !CryptographicOperations.FixedTimeEquals(actual, expected))
        {
            return null;
        }

        try
        {
            using var document = JsonDocument.Parse(Base64UrlDecode(parts[1]));
            var root = document.RootElement;
            var expires = root.GetProperty("exp").GetInt64();
            if (expires < DateTimeOffset.UtcNow.ToUnixTimeSeconds())
            {
                return null;
            }

            var id = root.GetProperty("sub").GetString();
            var username = root.GetProperty("username").GetString();
            var email = root.GetProperty("email").GetString();
            var jti = root.GetProperty("jti").GetString();
            var version = root.GetProperty("ver").GetInt32();
            if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(jti))
            {
                return null;
            }

            return new IssuedToken(new DemoUser(id, username, email), jti, version, expires);
        }
        catch (Exception exception) when (exception is JsonException or KeyNotFoundException or FormatException or InvalidOperationException)
        {
            return null;
        }
    }

    private string Sign(string value)
    {
        var hash = HMACSHA256.HashData(_key, Encoding.UTF8.GetBytes(value));
        return Base64Url(hash);
    }

    private static string Encode(object value)
    {
        return Base64Url(JsonSerializer.SerializeToUtf8Bytes(value));
    }

    private static string Base64Url(byte[] bytes)
    {
        return Convert.ToBase64String(bytes).TrimEnd('=').Replace('+', '-').Replace('/', '_');
    }

    private static byte[] Base64UrlDecode(string value)
    {
        var padded = value.Replace('-', '+').Replace('_', '/');
        padded = (padded.Length % 4) switch
        {
            2 => padded + "==",
            3 => padded + "=",
            _ => padded
        };
        return Convert.FromBase64String(padded);
    }
}
