namespace RecipeDiscovery.Api.Contracts;

public sealed class Ingredient
{
    public required string Name { get; init; }

    public required string Measure { get; init; }
}

public sealed class Recipe
{
    public required string Id { get; init; }

    public required string Name { get; init; }

    public required string Description { get; init; }

    public required IReadOnlyList<Ingredient> Ingredients { get; init; }

    public required string Cuisine { get; init; }

    public required int PreparationTimeMinutes { get; init; }

    public required string Difficulty { get; init; }

    public string? ImageUrl { get; init; }
}

public sealed class RecipePage
{
    public required int Page { get; init; }

    public required int PageSize { get; init; }

    public required int Total { get; init; }

    public required IReadOnlyList<Recipe> Items { get; init; }
}

public sealed class AddFavoriteRequest
{
    public string? RecipeId { get; set; }
}
