using System.Text.Json;

namespace RecipeDiscovery.Api.MealDb;

public sealed class MealDbClient : IMealDbClient
{
    private readonly HttpClient _http;

    public MealDbClient(HttpClient http)
    {
        _http = http;
    }

    public async Task<MealDbMeal?> LookupAsync(string id, CancellationToken cancellationToken)
    {
        var meals = await ReadMealsAsync($"lookup.php?i={Uri.EscapeDataString(id)}", cancellationToken);
        return meals.Count == 0 ? null : meals[0];
    }

    public Task<IReadOnlyList<MealDbMeal>> SearchByFirstLetterAsync(char letter, CancellationToken cancellationToken)
    {
        var key = char.ToLowerInvariant(letter);
        return ReadMealsAsync($"search.php?f={key}", cancellationToken);
    }

    private async Task<IReadOnlyList<MealDbMeal>> ReadMealsAsync(string relativeUrl, CancellationToken cancellationToken)
    {
        using var document = await GetDocumentAsync(relativeUrl, cancellationToken);
        if (!document.RootElement.TryGetProperty("meals", out var meals) || meals.ValueKind != JsonValueKind.Array)
        {
            return [];
        }

        var parsed = new List<MealDbMeal>();
        foreach (var meal in meals.EnumerateArray())
        {
            var mapped = ParseMeal(meal);
            if (mapped is not null)
            {
                parsed.Add(mapped);
            }
        }

        return parsed;
    }

    private async Task<JsonDocument> GetDocumentAsync(string relativeUrl, CancellationToken cancellationToken)
    {
        try
        {
            using var response = await _http.GetAsync(relativeUrl, cancellationToken);
            response.EnsureSuccessStatusCode();
            await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
            return await JsonDocument.ParseAsync(stream, cancellationToken: cancellationToken);
        }
        catch (HttpRequestException exception)
        {
            throw new MealDbUnavailableException("TheMealDB could not be reached.", exception);
        }
        catch (TaskCanceledException exception) when (!cancellationToken.IsCancellationRequested)
        {
            throw new MealDbUnavailableException("TheMealDB took too long to respond.", exception);
        }
        catch (JsonException exception)
        {
            throw new MealDbUnavailableException("TheMealDB returned a response that could not be read.", exception);
        }
    }

    private static MealDbMeal? ParseMeal(JsonElement meal)
    {
        var id = ReadString(meal, "idMeal");
        if (string.IsNullOrWhiteSpace(id))
        {
            return null;
        }

        var lines = new List<IngredientLine>();
        for (var index = 1; index <= 20; index++)
        {
            var name = ReadString(meal, $"strIngredient{index}");
            if (string.IsNullOrWhiteSpace(name))
            {
                continue;
            }

            var measure = ReadString(meal, $"strMeasure{index}") ?? "";
            lines.Add(new IngredientLine(name.Trim(), measure.Trim()));
        }

        return new MealDbMeal(
            id.Trim(),
            ReadString(meal, "strMeal")?.Trim() ?? "",
            ReadString(meal, "strArea")?.Trim(),
            ReadString(meal, "strCountry")?.Trim(),
            ReadString(meal, "strInstructions"),
            ReadString(meal, "strMealThumb")?.Trim(),
            lines);
    }

    private static string? ReadString(JsonElement element, string name)
    {
        if (!element.TryGetProperty(name, out var value))
        {
            return null;
        }

        return value.ValueKind == JsonValueKind.String ? value.GetString() : null;
    }
}
