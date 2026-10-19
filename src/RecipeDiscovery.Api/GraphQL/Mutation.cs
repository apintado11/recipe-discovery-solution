using HotChocolate;
using RecipeDiscovery.Api.Auth;
using RecipeDiscovery.Api.Contracts;
using RecipeDiscovery.Api.Services;

namespace RecipeDiscovery.Api.GraphQL;

public sealed class Mutation
{
    public Task<IReadOnlyList<Recipe>> AddFavorite(
        [ID] string userId,
        [ID] string recipeId,
        [Service] IFavoriteService favorites,
        [Service] IHttpContextAccessor http,
        CancellationToken cancellationToken)
    {
        return favorites.AddFavoriteAsync(userId, CurrentUser.RequireId(http), recipeId, cancellationToken);
    }
}
