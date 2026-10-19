using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;

namespace RecipeDiscovery.Api.Tests;

public sealed class AuthTests : IClassFixture<ApiFactory>
{
    private readonly ApiFactory _factory;

    public AuthTests(ApiFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Login_KnownUser_ReturnsToken()
    {
        var client = _factory.CreateClient();
        var response = await client.PostAsJsonAsync("/auth/login", new { username = "Blair" });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var payload = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal("2", payload.GetProperty("user").GetProperty("id").GetString());
        Assert.Equal("blair", payload.GetProperty("user").GetProperty("username").GetString());
        Assert.False(string.IsNullOrWhiteSpace(payload.GetProperty("token").GetString()));
    }

    [Fact]
    public async Task Favorites_WithoutToken_Returns401()
    {
        var client = _factory.CreateClient();
        var response = await client.GetAsync("/users/1/favorites");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Favorites_ForAnotherUser_Returns403()
    {
        var client = await LoginAsync("alex");
        var response = await client.GetAsync("/users/2/favorites");

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Favorites_AreSeparatePerUser()
    {
        var alex = await LoginAsync("alex");
        var saved = await alex.PostAsJsonAsync("/users/1/favorites", new { recipeId = FakeMealDbClient.KnownId });
        Assert.Equal(HttpStatusCode.OK, saved.StatusCode);

        var blair = await LoginAsync("blair");
        var response = await blair.GetAsync("/users/2/favorites");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var favorites = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal(JsonValueKind.Array, favorites.ValueKind);
        Assert.Equal(0, favorites.GetArrayLength());
    }

    private async Task<HttpClient> LoginAsync(string username)
    {
        var client = _factory.CreateClient();
        var response = await client.PostAsJsonAsync("/auth/login", new { username });
        response.EnsureSuccessStatusCode();
        var payload = await response.Content.ReadFromJsonAsync<JsonElement>();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
            "Bearer",
            payload.GetProperty("token").GetString());
        return client;
    }
}
