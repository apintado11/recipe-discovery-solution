namespace RecipeDiscovery.Api.MealDb;

public sealed record IngredientLine(string Name, string Measure);

public sealed record MealDbMeal(
    string Id,
    string Name,
    string? Area,
    string? Country,
    string? Instructions,
    string? Thumbnail,
    IReadOnlyList<IngredientLine> Ingredients);
