namespace RecipeDiscovery.Api.MealDb;

public interface IMealDbClient
{
    Task<MealDbMeal?> LookupAsync(string id, CancellationToken cancellationToken);

    Task<IReadOnlyList<MealDbMeal>> SearchByFirstLetterAsync(char letter, CancellationToken cancellationToken);
}
