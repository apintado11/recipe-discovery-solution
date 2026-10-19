using RecipeDiscovery.Api.MealDb;

namespace RecipeDiscovery.Api.Tests;

public sealed class FakeMealDbClient : IMealDbClient
{
    public const string KnownId = "900001";

    public static readonly MealDbMeal LemonPasta = new(
        KnownId,
        "Test Lemon Pasta",
        "Italian",
        "Italy",
        "Boil the pasta. Toss it with lemon and olive oil.",
        "https://example.test/lemon-pasta.jpg",
        [
            new IngredientLine("pasta", "200 g"),
            new IngredientLine("lemon", "1"),
            new IngredientLine("olive oil", "2 tbsp")
        ]);

    public Task<MealDbMeal?> LookupAsync(string id, CancellationToken cancellationToken)
    {
        return Task.FromResult(id == KnownId ? LemonPasta : null);
    }

    public Task<IReadOnlyList<MealDbMeal>> SearchByFirstLetterAsync(char letter, CancellationToken cancellationToken)
    {
        IReadOnlyList<MealDbMeal> meals = char.ToLowerInvariant(letter) == 't'
            ? [LemonPasta]
            : [];
        return Task.FromResult(meals);
    }
}
