using RecipeDiscovery.Api.Contracts;

namespace RecipeDiscovery.Api.Services;

public sealed class RecipeCache
{
    private readonly ConcurrentDictionary<string, Recipe> _recipes = new(StringComparer.Ordinal);
    private readonly ConcurrentDictionary<string, SemaphoreSlim> _gates = new(StringComparer.Ordinal);

    public bool TryGet(string id, out Recipe? recipe)
    {
        return _recipes.TryGetValue(id, out recipe);
    }

    public void Set(Recipe recipe)
    {
        _recipes[recipe.Id] = recipe;
    }

    public SemaphoreSlim Gate(string id)
    {
        return _gates.GetOrAdd(id, static _ => new SemaphoreSlim(1, 1));
    }
}
