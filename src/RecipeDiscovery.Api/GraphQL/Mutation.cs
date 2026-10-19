using HotChocolate;
using RecipeDiscovery.Api.Contracts;
using RecipeDiscovery.Api.Services;

namespace RecipeDiscovery.Api.GraphQL;

public sealed class Mutation
{
    public Task<IReadOnlyList<Recipe>> AddFavorite(
        [ID] string userId,
        [ID] string recipeId,
        [Service] IFavoriteService favorites,
        CancellationToken cancellationToken)
    {
        return favorites.AddFavoriteAsync(userId, recipeId, cancellationToken);
    }
}
