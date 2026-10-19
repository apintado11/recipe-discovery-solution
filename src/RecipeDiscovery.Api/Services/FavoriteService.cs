using RecipeDiscovery.Api.Contracts;

namespace RecipeDiscovery.Api.Services;

public sealed class FavoriteService : IFavoriteService
{
    private readonly FavoriteStore _store;
    private readonly IRecipeService _recipes;

    public FavoriteService(FavoriteStore store, IRecipeService recipes)
    {
        _store = store;
        _recipes = recipes;
    }

    public async Task<IReadOnlyList<Recipe>> GetFavoritesAsync(string userId, CancellationToken cancellationToken)
    {
        var key = RequireUser(userId);
        var ids = _store.Get(key);
        var recipes = new List<Recipe>(ids.Count);
        foreach (var id in ids)
        {
            var recipe = await _recipes.GetByIdAsync(id, cancellationToken);
            if (recipe is not null)
            {
                recipes.Add(recipe);
            }
        }

        return recipes;
    }

    public async Task<IReadOnlyList<Recipe>> AddFavoriteAsync(
        string userId,
        string recipeId,
        CancellationToken cancellationToken)
    {
        var key = RequireUser(userId);
        if (string.IsNullOrWhiteSpace(recipeId))
        {
            throw new NotFoundException("Recipe id is required.");
        }

        var recipe = await _recipes.GetByIdAsync(recipeId.Trim(), cancellationToken);
        if (recipe is null)
        {
            throw new NotFoundException($"Recipe '{recipeId.Trim()}' was not found.");
        }

        _store.Add(key, recipe.Id);
        return await GetFavoritesAsync(key, cancellationToken);
    }

    private string RequireUser(string userId)
    {
        var key = userId.Trim();
        if (!_store.UserExists(key))
        {
            throw new NotFoundException($"User '{key}' was not found.");
        }

        return key;
    }
}
