namespace RecipeDiscovery.Api.Auth;

public sealed class AuthOptions
{
    public const string Section = "Auth";

    public bool Persist { get; set; } = true;

    public bool LocalMailbox { get; set; }

    public string PublicAppUrl { get; set; } = "http://localhost:5173";

    public string? StorePath { get; set; }
}
