using System.Security.Claims;

namespace RecipeDiscovery.Api.Auth;

public static class CurrentUser
{
    public static string RequireId(IHttpContextAccessor http)
    {
        var id = http.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(id))
        {
            throw new ForbiddenException("Login is required.");
        }

        return id;
    }
}
