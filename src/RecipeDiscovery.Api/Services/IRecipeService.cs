using RecipeDiscovery.Api.Contracts;

namespace RecipeDiscovery.Api.Services;

public interface IRecipeService
{
    Task<Recipe?> GetByIdAsync(string id, CancellationToken cancellationToken);

    Task<RecipePage> SearchAsync(RecipeQuery query, CancellationToken cancellationToken);

    Task<IReadOnlyList<string>> GetCuisinesAsync(CancellationToken cancellationToken);
}
