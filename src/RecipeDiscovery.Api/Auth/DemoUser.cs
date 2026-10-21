namespace RecipeDiscovery.Api.Auth;

public sealed record DemoUser(string Id, string Username, string Email);

public sealed record Authenticated(DemoUser User, int PasswordVersion);
