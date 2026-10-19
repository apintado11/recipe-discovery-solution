namespace RecipeDiscovery.Api.Services;

public sealed record RecipeQuery(
    string? Cuisine,
    string? Ingredient,
    string? Search,
    int Page,
    int PageSize,
    string Sort,
    string Direction)
{
    public const int DefaultPageSize = 12;
    public const int MaxPageSize = 24;
    public const string SortName = "name";
    public const string SortPrepTime = "prepTime";
    public const string SortDifficulty = "difficulty";

    public static RecipeQuery Create(
        string? cuisine,
        string? ingredient,
        string? search,
        int page,
        int pageSize,
        string? sort = null,
        string? direction = null)
    {
        var normalizedPage = page < 1 ? 1 : page;
        var normalizedSize = pageSize switch
        {
            < 1 => DefaultPageSize,
            > MaxPageSize => MaxPageSize,
            _ => pageSize
        };

        return new RecipeQuery(
            Clean(cuisine),
            Clean(ingredient),
            Clean(search),
            normalizedPage,
            normalizedSize,
            NormalizeSort(sort),
            NormalizeDirection(direction));
    }

    private static string? Clean(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }

    private static string NormalizeSort(string? sort)
    {
        return (sort ?? "").Trim().ToLowerInvariant() switch
        {
            "preptime" or "prep" or "preparationtime" => SortPrepTime,
            "difficulty" => SortDifficulty,
            _ => SortName
        };
    }

    private static string NormalizeDirection(string? direction)
    {
        return string.Equals(direction?.Trim(), "desc", StringComparison.OrdinalIgnoreCase) ? "desc" : "asc";
    }
}
