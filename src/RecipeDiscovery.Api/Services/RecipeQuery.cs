namespace RecipeDiscovery.Api.Services;

public sealed record RecipeQuery(string? Cuisine, string? Ingredient, string? Search, int Page, int PageSize)
{
    public const int DefaultPageSize = 12;
    public const int MaxPageSize = 24;

    public static RecipeQuery Create(string? cuisine, string? ingredient, string? search, int page, int pageSize)
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
            normalizedSize);
    }

    private static string? Clean(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }
}
