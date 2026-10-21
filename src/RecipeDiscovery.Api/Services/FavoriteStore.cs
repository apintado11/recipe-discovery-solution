namespace RecipeDiscovery.Api.Services;

public sealed class FavoriteStore
{
    private readonly ConcurrentDictionary<string, List<string>> _favorites = new(StringComparer.Ordinal);

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
