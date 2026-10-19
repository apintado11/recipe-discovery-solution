using RecipeDiscovery.Api.Contracts;
using RecipeDiscovery.Api.MealDb;

namespace RecipeDiscovery.Api.Services;

public static class RecipeMapper
{
    public static Recipe ToRecipe(MealDbMeal meal)
    {
        var description = (meal.Instructions ?? "").Replace("\r\n", "\n", StringComparison.Ordinal).Trim();
        var ingredients = meal.Ingredients
            .Where(line => !string.IsNullOrWhiteSpace(line.Name))
            .Select(line => new Ingredient
            {
                Name = line.Name.Trim(),
                Measure = line.Measure.Trim()
            })
            .ToList();

        var (minutes, difficulty) = Estimate(ingredients.Count, description);

        return new Recipe
        {
            Id = meal.Id,
            Name = string.IsNullOrWhiteSpace(meal.Name) ? "Untitled" : meal.Name.Trim(),
            Description = description,
            Ingredients = ingredients,
            Cuisine = FirstText(meal.Area, meal.Country) ?? "Unknown",
            PreparationTimeMinutes = minutes,
            Difficulty = difficulty,
            ImageUrl = string.IsNullOrWhiteSpace(meal.Thumbnail) ? null : meal.Thumbnail.Trim()
        };
    }

    /// <summary>
    /// TheMealDB has no prep time or difficulty. Both values are estimates derived once,
    /// when a meal is mapped into the local recipe model.
    /// </summary>
    public static (int Minutes, string Difficulty) Estimate(int ingredientCount, string description)
    {
        var minutes = 15 + (ingredientCount * 2) + (description.Length / 100);
        minutes = Math.Clamp(minutes, 10, 120);

        string difficulty;
        if (minutes <= 30 && ingredientCount <= 8)
        {
            difficulty = "Easy";
        }
        else if (minutes >= 60 || ingredientCount >= 12)
        {
            difficulty = "Hard";
        }
        else
        {
            difficulty = "Medium";
        }

        return (minutes, difficulty);
    }

    private static string? FirstText(params string?[] values)
    {
        foreach (var value in values)
        {
            if (!string.IsNullOrWhiteSpace(value))
            {
                return value.Trim();
            }
        }

        return null;
    }
}
