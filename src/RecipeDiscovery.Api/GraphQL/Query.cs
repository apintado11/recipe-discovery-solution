using HotChocolate;
using RecipeDiscovery.Api.Auth;
using RecipeDiscovery.Api.Contracts;
using RecipeDiscovery.Api.Services;

namespace RecipeDiscovery.Api.GraphQL;

public sealed class Query
{
    public Task<RecipePage> GetRecipes(
        string? cuisine,
        string? ingredient,
        string? search,
        int? page,
        int? pageSize,
        string? sort,
        string? direction,
        [Service] IRecipeService recipes,
        CancellationToken cancellationToken)
    {
        return recipes.SearchAsync(
            RecipeQuery.Create(
                cuisine,
                ingredient,
                search,
                page ?? 1,
                pageSize ?? RecipeQuery.DefaultPageSize,
                sort,
                direction),
            cancellationToken);
    }

    public async Task<Recipe> GetRecipe(
        [ID] string id,
        [Service] IRecipeService recipes,
        CancellationToken cancellationToken)
    {
        var recipe = await recipes.GetByIdAsync(id, cancellationToken);
        if (recipe is null)
        {
            throw new NotFoundException($"Recipe '{id}' was not found.");
        }

        return recipe;
    }

    public Task<IReadOnlyList<Recipe>> GetFavorites(
        [ID] string userId,
        [Service] IFavoriteService favorites,
        [Service] IHttpContextAccessor http,
        CancellationToken cancellationToken)
    {
        return favorites.GetFavoritesAsync(userId, CurrentUser.RequireId(http), cancellationToken);
    }
}
