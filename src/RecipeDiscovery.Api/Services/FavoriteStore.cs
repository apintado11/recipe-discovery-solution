namespace RecipeDiscovery.Api.Services;

public sealed class FavoriteStore
{
    private readonly ConcurrentDictionary<string, string> _users = new(StringComparer.Ordinal)
    {
        ["1"] = "demo"
    };

    private readonly ConcurrentDictionary<string, List<string>> _favorites = new(StringComparer.Ordinal);

    public bool UserExists(string userId)
    {
        return _users.ContainsKey(userId);
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
