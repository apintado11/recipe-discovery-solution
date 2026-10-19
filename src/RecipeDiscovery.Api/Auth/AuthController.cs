using Microsoft.AspNetCore.Mvc;
using RecipeDiscovery.Api.Services;

namespace RecipeDiscovery.Api.Auth;

[ApiController]
[Route("auth")]
public sealed class AuthController : ControllerBase
{
    private readonly FavoriteStore _users;
    private readonly DemoTokenService _tokens;

    public AuthController(FavoriteStore users, DemoTokenService tokens)
    {
        _users = users;
        _tokens = tokens;
    }

    [HttpGet("users")]
    public ActionResult<IReadOnlyList<DemoUser>> List()
    {
        return Ok(_users.List());
    }

    [HttpPost("login")]
    public ActionResult Login([FromBody] LoginRequest? request)
    {
        if (request is null || string.IsNullOrWhiteSpace(request.Username))
        {
            return Problem(statusCode: StatusCodes.Status400BadRequest, title: "Username is required");
        }

        var user = _users.FindByUsername(request.Username);
        if (user is null)
        {
            return Problem(statusCode: StatusCodes.Status401Unauthorized, title: "Unknown user");
        }

        return Ok(new
        {
            token = _tokens.Create(user),
            user
        });
    }
}

public sealed class LoginRequest
{
    public string? Username { get; set; }
}
