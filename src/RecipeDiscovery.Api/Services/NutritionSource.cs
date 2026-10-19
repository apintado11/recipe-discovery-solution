using RecipeDiscovery.Api.Contracts;

namespace RecipeDiscovery.Api.Services;

public sealed class Nutrition
{
    public required double Calories { get; init; }

    public required double Protein { get; init; }
}

public interface INutritionSource
{
    Nutrition Estimate(Recipe recipe);
}

/// <summary>
/// Mock nutrition source used only by the GraphQL field resolver.
/// TheMealDB does not provide calories or protein.
/// </summary>
public sealed class NutritionSource : INutritionSource
{
    private static readonly (string Key, double Calories, double Protein)[] Table =
    [
        ("olive oil", 120, 0),
        ("vegetable oil", 120, 0),
        ("chicken breast", 185, 35),
        ("chicken", 180, 27),
        ("beef", 210, 26),
        ("salmon", 200, 22),
        ("pasta", 220, 8),
        ("rice", 200, 4),
        ("cheese", 110, 7),
        ("egg", 70, 6),
        ("butter", 100, 0),
        ("sugar", 50, 0),
        ("lemon", 15, 0.5),
        ("oil", 120, 0)
    ];

    public Nutrition Estimate(Recipe recipe)
    {
        double calories = 0;
        double protein = 0;
        foreach (var ingredient in recipe.Ingredients)
        {
            var name = ingredient.Name.Trim().ToLowerInvariant();
            var match = Table.FirstOrDefault(row => name.Contains(row.Key, StringComparison.Ordinal));
            if (match.Key is null)
            {
                calories += 45;
                protein += 1.5;
                continue;
            }

            calories += match.Calories;
            protein += match.Protein;
        }

        return new Nutrition
        {
            Calories = calories,
            Protein = protein
        };
    }
}
