using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;

namespace RecipeDiscovery.Api.Tests;

public sealed class AuthTests : IClassFixture<ApiFactory>
{
    private const string DemoPassword = "cookbook";

    private readonly ApiFactory _factory;

    public AuthTests(ApiFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Login_KnownUser_ReturnsToken()
    {
        var client = _factory.CreateClient();
        var response = await client.PostAsJsonAsync("/auth/login", new { email = "Blair@recipe.test", password = DemoPassword });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var payload = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal("2", payload.GetProperty("user").GetProperty("id").GetString());
        Assert.Equal("Blair", payload.GetProperty("user").GetProperty("username").GetString());
        Assert.Equal("blair@recipe.test", payload.GetProperty("user").GetProperty("email").GetString());
        Assert.False(string.IsNullOrWhiteSpace(payload.GetProperty("token").GetString()));
    }

    [Fact]
    public async Task Login_WrongPassword_Returns401()
    {
        var client = _factory.CreateClient();
        var response = await client.PostAsJsonAsync("/auth/login", new { email = "alex@recipe.test", password = "nope1234" });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Register_DuplicateEmail_Returns409()
    {
        var client = _factory.CreateClient();
        var response = await client.PostAsJsonAsync("/auth/register", new
        {
            name = "Alex Two",
            email = "alex@recipe.test",
            password = "kitchen1"
        });

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task Logout_RevokesToken()
    {
        var client = await LoginAsync("alex@recipe.test");
        var logout = await client.PostAsync("/auth/logout", null);
        Assert.Equal(HttpStatusCode.NoContent, logout.StatusCode);

        var favorites = await client.GetAsync("/users/1/favorites");
        Assert.Equal(HttpStatusCode.Unauthorized, favorites.StatusCode);
    }

    [Fact]
    public async Task ResetPassword_ReplacesTheOldPassword()
    {
        var client = _factory.CreateClient();
        var email = $"reset-{Guid.NewGuid():N}@recipe.test";
        var created = await client.PostAsJsonAsync("/auth/register", new { name = "Riley", email, password = "kitchen1" });
        Assert.Equal(HttpStatusCode.OK, created.StatusCode);
        var createdBody = await created.Content.ReadFromJsonAsync<JsonElement>();
        var createdToken = createdBody.GetProperty("token").GetString();
        var userId = createdBody.GetProperty("user").GetProperty("id").GetString();

        var forgot = await client.PostAsJsonAsync("/auth/forgot-password", new { email });
        Assert.Equal(HttpStatusCode.OK, forgot.StatusCode);
        var forgotBody = await forgot.Content.ReadFromJsonAsync<JsonElement>();
        Assert.True(forgotBody.GetProperty("localDelivery").GetBoolean());

        var token = await LatestResetToken(client, email);
        var reset = await client.PostAsJsonAsync("/auth/reset-password", new { token, password = "kitchen2" });
        Assert.Equal(HttpStatusCode.OK, reset.StatusCode);

        var spent = await client.PostAsJsonAsync("/auth/reset-password", new { token, password = "kitchen3" });
        Assert.Equal(HttpStatusCode.BadRequest, spent.StatusCode);

        var oldLogin = await client.PostAsJsonAsync("/auth/login", new { email, password = "kitchen1" });
        Assert.Equal(HttpStatusCode.Unauthorized, oldLogin.StatusCode);

        var newLogin = await client.PostAsJsonAsync("/auth/login", new { email, password = "kitchen2" });
        Assert.Equal(HttpStatusCode.OK, newLogin.StatusCode);

        var createdClient = _factory.CreateClient();
        createdClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", createdToken);
        var stale = await createdClient.GetAsync($"/users/{userId}/favorites");
        Assert.Equal(HttpStatusCode.Unauthorized, stale.StatusCode);
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
        var client = await LoginAsync("alex@recipe.test");
        var response = await client.GetAsync("/users/2/favorites");

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Favorites_AreSeparatePerUser()
    {
        var alex = await LoginAsync("alex@recipe.test");
        var saved = await alex.PostAsJsonAsync("/users/1/favorites", new { recipeId = FakeMealDbClient.KnownId });
        Assert.Equal(HttpStatusCode.OK, saved.StatusCode);

        var blair = await LoginAsync("blair@recipe.test");
        var response = await blair.GetAsync("/users/2/favorites");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var favorites = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal(JsonValueKind.Array, favorites.ValueKind);
        Assert.Equal(0, favorites.GetArrayLength());
    }

    private async Task<HttpClient> LoginAsync(string email)
    {
        var client = _factory.CreateClient();
        var response = await client.PostAsJsonAsync("/auth/login", new { email, password = DemoPassword });
        response.EnsureSuccessStatusCode();
        var payload = await response.Content.ReadFromJsonAsync<JsonElement>();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
            "Bearer",
            payload.GetProperty("token").GetString());
        return client;
    }

    private static async Task<string> LatestResetToken(HttpClient client, string email)
    {
        var mailbox = await client.GetAsync("/auth/mailbox?email=" + Uri.EscapeDataString(email));
        Assert.Equal(HttpStatusCode.OK, mailbox.StatusCode);
        var mail = await mailbox.Content.ReadFromJsonAsync<JsonElement>();
        var resetUrl = mail.GetProperty("messages")[0].GetProperty("resetUrl").GetString();
        var query = new Uri(resetUrl!).Query.TrimStart('?');
        var token = query.Split('&').First(part => part.StartsWith("token=", StringComparison.Ordinal))["token=".Length..];
        return Uri.UnescapeDataString(token);
    }
}
