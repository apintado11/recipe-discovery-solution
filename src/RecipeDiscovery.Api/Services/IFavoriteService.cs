using RecipeDiscovery.Api.Contracts;

namespace RecipeDiscovery.Api.Services;

public interface IFavoriteService
{
    Task<IReadOnlyList<Recipe>> GetFavoritesAsync(string userId, string callerId, CancellationToken cancellationToken);

    Task<IReadOnlyList<Recipe>> AddFavoriteAsync(
        string userId,
        string callerId,
        string recipeId,
        CancellationToken cancellationToken);
}
