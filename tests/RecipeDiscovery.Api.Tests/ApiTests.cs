using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using RecipeDiscovery.Api.Contracts;

namespace RecipeDiscovery.Api.Tests;

public sealed class ApiTests : IClassFixture<ApiFactory>
{
    private readonly HttpClient _client;

    public ApiTests(ApiFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetRecipe_ReturnsMappedRecipe()
    {
        var response = await _client.GetAsync($"/recipes/{FakeMealDbClient.KnownId}");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var recipe = await response.Content.ReadFromJsonAsync<Recipe>();
        Assert.NotNull(recipe);
        Assert.Equal("Test Lemon Pasta", recipe.Name);
        Assert.Equal("Italian", recipe.Cuisine);
        Assert.Equal(3, recipe.Ingredients.Count);
        Assert.Equal(21, recipe.PreparationTimeMinutes);
        Assert.Equal("Easy", recipe.Difficulty);
        Assert.Equal("https://example.test/lemon-pasta.jpg", recipe.ImageUrl);
    }

    [Fact]
    public async Task ListRecipes_FiltersCuisineFromTheCatalog()
    {
        var response = await _client.GetAsync("/recipes?cuisine=italian&pageSize=12");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var page = await response.Content.ReadFromJsonAsync<RecipePage>();
        Assert.NotNull(page);
        Assert.Equal(1, page.Total);
        Assert.Equal("Test Lemon Pasta", page.Items[0].Name);

        var cuisines = await _client.GetFromJsonAsync<string[]>("/cuisines");
        Assert.NotNull(cuisines);
        Assert.Contains("Italian", cuisines);
    }

    [Fact]
    public async Task ListRecipes_SortsByPrepTime()
    {
        var response = await _client.GetAsync("/recipes?sort=prepTime&direction=asc&pageSize=12");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var page = await response.Content.ReadFromJsonAsync<RecipePage>();
        Assert.NotNull(page);
        Assert.Equal(["Apple Tart", "Test Lemon Pasta", "Zucchini Bake"], page.Items.Select(item => item.Name).ToArray());
    }

    [Fact]
    public async Task RecipeQuery_IncludesNutritionFromTheSecondSource()
    {
        var document = await PostQueryAsync(
            $$"""
            query {
              recipe(id: "{{FakeMealDbClient.KnownId}}") {
                nutrition { calories protein }
              }
            }
            """);

        AssertNoErrors(document);
        var nutrition = document.RootElement.GetProperty("data").GetProperty("recipe").GetProperty("nutrition");
        Assert.Equal(355, nutrition.GetProperty("calories").GetDouble());
        Assert.Equal(8.5, nutrition.GetProperty("protein").GetDouble());

        var rest = await _client.GetStringAsync($"/recipes/{FakeMealDbClient.KnownId}");
        Assert.DoesNotContain("nutrition", rest, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task GetRecipe_MissingId_Returns404()
    {
        var response = await _client.GetAsync("/recipes/missing");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task AddFavorite_ThenQuery_ReturnsRecipe()
    {
        await LoginAsync();
        var added = await PostQueryAsync(
            $$"""
            mutation {
              addFavorite(userId: "1", recipeId: "{{FakeMealDbClient.KnownId}}") {
                id
                name
                cuisine
                preparationTimeMinutes
                difficulty
              }
            }
            """);

        AssertNoErrors(added);
        var favorite = added.RootElement.GetProperty("data").GetProperty("addFavorite")[0];
        Assert.Equal(FakeMealDbClient.KnownId, favorite.GetProperty("id").GetString());
        Assert.Equal("Test Lemon Pasta", favorite.GetProperty("name").GetString());
        Assert.Equal("Italian", favorite.GetProperty("cuisine").GetString());

        var listed = await PostQueryAsync(
            """
            query {
              favorites(userId: "1") {
                id
                name
              }
            }
            """);

        AssertNoErrors(listed);
        var ids = listed.RootElement.GetProperty("data").GetProperty("favorites")
            .EnumerateArray()
            .Select(item => item.GetProperty("id").GetString())
            .ToList();
        Assert.Contains(FakeMealDbClient.KnownId, ids);
    }

    [Fact]
    public async Task AddFavorite_UnknownRecipe_ReturnsNotFound()
    {
        await LoginAsync();
        var result = await PostQueryAsync(
            """
            mutation {
              addFavorite(userId: "1", recipeId: "missing") {
                id
              }
            }
            """);

        var error = result.RootElement.GetProperty("errors")[0];
        Assert.Equal("NOT_FOUND", error.GetProperty("extensions").GetProperty("code").GetString());
        Assert.Contains("missing", error.GetProperty("message").GetString(), StringComparison.Ordinal);
    }

    private async Task LoginAsync(string username = "alex")
    {
        var response = await _client.PostAsJsonAsync("/auth/login", new { username });
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var payload = await response.Content.ReadFromJsonAsync<JsonElement>();
        var token = payload.GetProperty("token").GetString();
        Assert.False(string.IsNullOrWhiteSpace(token));
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
    }

    private async Task<JsonDocument> PostQueryAsync(string query)
    {
        var response = await _client.PostAsJsonAsync("/graphql", new { query });
        var body = await response.Content.ReadAsStringAsync();
        Assert.True(response.StatusCode == HttpStatusCode.OK, body);
        return JsonDocument.Parse(body);
    }

    private static void AssertNoErrors(JsonDocument document)
    {
        Assert.False(document.RootElement.TryGetProperty("errors", out _));
    }
}
