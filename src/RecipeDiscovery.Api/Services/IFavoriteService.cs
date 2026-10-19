using RecipeDiscovery.Api.Contracts;

namespace RecipeDiscovery.Api.Services;

public interface IFavoriteService
{
    Task<IReadOnlyList<Recipe>> GetFavoritesAsync(string userId, CancellationToken cancellationToken);

    Task<IReadOnlyList<Recipe>> AddFavoriteAsync(string userId, string recipeId, CancellationToken cancellationToken);
}
