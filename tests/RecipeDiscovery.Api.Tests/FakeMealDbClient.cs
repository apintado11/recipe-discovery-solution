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

    public static readonly MealDbMeal AppleTart = new(
        "900002",
        "Apple Tart",
        "British",
        "United Kingdom",
        "Slice the apples.",
        null,
        [
            new IngredientLine("apple", "2"),
            new IngredientLine("sugar", "50 g")
        ]);

    public static readonly MealDbMeal ZucchiniBake = new(
        "900003",
        "Zucchini Bake",
        "American",
        "United States",
        "Bake it.",
        null,
        Enumerable.Range(1, 12).Select(index => new IngredientLine($"beef {index}", "1")).ToList());

    private static readonly MealDbMeal[] Meals = [AppleTart, LemonPasta, ZucchiniBake];

    public Task<MealDbMeal?> LookupAsync(string id, CancellationToken cancellationToken)
    {
        return Task.FromResult(Meals.FirstOrDefault(meal => meal.Id == id));
    }

    public Task<IReadOnlyList<MealDbMeal>> SearchByFirstLetterAsync(char letter, CancellationToken cancellationToken)
    {
        var key = char.ToLowerInvariant(letter);
        IReadOnlyList<MealDbMeal> meals = Meals
            .Where(meal => meal.Name.Length > 0 && char.ToLowerInvariant(meal.Name[0]) == key)
            .ToList();
        return Task.FromResult(meals);
    }
}
