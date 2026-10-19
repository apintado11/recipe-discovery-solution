using RecipeDiscovery.Api.Auth;

namespace RecipeDiscovery.Api.Services;

public sealed class FavoriteStore
{
    private readonly DemoUser[] _users =
    [
        new("1", "alex"),
        new("2", "blair"),
        new("3", "casey")
    ];

    private readonly ConcurrentDictionary<string, List<string>> _favorites = new(StringComparer.Ordinal);

    public IReadOnlyList<DemoUser> List()
    {
        return _users;
    }

    public DemoUser? FindByUsername(string username)
    {
        var key = username.Trim();
        return _users.FirstOrDefault(user => user.Username.Equals(key, StringComparison.OrdinalIgnoreCase));
    }

    public bool UserExists(string userId)
    {
        return _users.Any(user => user.Id == userId);
    }

    public void Add(string userId, string recipeId)
    {
        var favorites = _favorites.GetOrAdd(userId, static _ => []);
        lock (favorites)
        {
            if (!favorites.Contains(recipeId, StringComparer.Ordinal))
            {
                favorites.Add(recipeId);
            }
        }
    }

    public IReadOnlyList<string> Get(string userId)
    {
        if (!_favorites.TryGetValue(userId, out var favorites))
        {
            return [];
        }

        lock (favorites)
        {
            return favorites.ToList();
        }
    }
}
