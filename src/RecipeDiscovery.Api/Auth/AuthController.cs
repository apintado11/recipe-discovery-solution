using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace RecipeDiscovery.Api.Auth;

[ApiController]
[Route("auth")]
public sealed class AuthController : ControllerBase
{
    private readonly AccountStore _accounts;
    private readonly DemoTokenService _tokens;
    private readonly AuthOptions _options;

    public AuthController(AccountStore accounts, DemoTokenService tokens, IOptions<AuthOptions> options)
    {
        _accounts = accounts;
        _tokens = tokens;
        _options = options.Value;
    }

    [HttpPost("register")]
    public ActionResult Register([FromBody] RegisterRequest? request)
    {
        var nameError = AuthRules.CheckName(request?.Name);
        if (nameError is not null)
        {
            return Problem(statusCode: StatusCodes.Status400BadRequest, title: "Check the form", detail: nameError);
        }

        var emailError = AuthRules.CheckEmail(request?.Email);
        if (emailError is not null)
        {
            return Problem(statusCode: StatusCodes.Status400BadRequest, title: "Check the form", detail: emailError);
        }

        var passwordError = AuthRules.CheckPassword(request?.Password);
        if (passwordError is not null)
        {
            return Problem(statusCode: StatusCodes.Status400BadRequest, title: "Check the form", detail: passwordError);
        }

        var created = _accounts.Register(request!.Name!, request.Email!, request.Password!);
        if (created is null)
        {
            return Problem(
                statusCode: StatusCodes.Status409Conflict,
                title: "That email is already registered.",
                detail: "That email is already registered. Sign in, or reset the password.");
        }

        return Ok(Session(created));
    }

    [HttpPost("login")]
    public ActionResult Login([FromBody] LoginRequest? request)
    {
        if (request is null || string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return Problem(statusCode: StatusCodes.Status400BadRequest, title: "Email and password are required.");
        }

        var authenticated = _accounts.Authenticate(request.Email, request.Password);
        if (authenticated is null)
        {
            return Problem(statusCode: StatusCodes.Status401Unauthorized, title: "Email or password is incorrect.");
        }

        return Ok(Session(authenticated));
    }

    [Authorize]
    [HttpPost("logout")]
    public IActionResult Logout()
    {
        var header = Request.Headers.Authorization.ToString();
        const string prefix = "Bearer ";
        if (header.StartsWith(prefix, StringComparison.OrdinalIgnoreCase))
        {
            var issued = _tokens.Read(header[prefix.Length..].Trim());
            if (issued is not null)
            {
                _accounts.Revoke(issued.Jti, issued.Expires);
            }
        }

        return NoContent();
    }

    [HttpPost("forgot-password")]
    public ActionResult ForgotPassword([FromBody] ForgotPasswordRequest? request)
    {
        var emailError = AuthRules.CheckEmail(request?.Email);
        if (emailError is not null)
        {
            return Problem(statusCode: StatusCodes.Status400BadRequest, title: "Check the form", detail: emailError);
        }

        _accounts.BeginReset(request!.Email!, _options.PublicAppUrl, _options.LocalMailbox);
        return Ok(new { accepted = true, localDelivery = _options.LocalMailbox });
    }

    [HttpPost("reset-password")]
    public ActionResult ResetPassword([FromBody] ResetPasswordRequest? request)
    {
        if (request is null || string.IsNullOrWhiteSpace(request.Token))
        {
            return Problem(statusCode: StatusCodes.Status400BadRequest, title: "Check the form", detail: "That reset link is incomplete.");
        }

        var passwordError = AuthRules.CheckPassword(request.Password);
        if (passwordError is not null)
        {
            return Problem(statusCode: StatusCodes.Status400BadRequest, title: "Check the form", detail: passwordError);
        }

        var error = _accounts.CompleteReset(request.Token, request.Password!);
        if (error is not null)
        {
            return Problem(statusCode: StatusCodes.Status400BadRequest, title: "Check the form", detail: error);
        }

        return Ok(new { reset = true });
    }

    [HttpGet("mailbox")]
    public ActionResult Mailbox([FromQuery] string? email)
    {
        if (!_options.LocalMailbox)
        {
            return Problem(statusCode: StatusCodes.Status404NotFound, title: "The local inbox is not available.");
        }

        if (string.IsNullOrWhiteSpace(email))
        {
            return Problem(statusCode: StatusCodes.Status400BadRequest, title: "Email is required.");
        }

        var messages = _accounts.MessagesFor(email).Select(message => new
        {
            id = message.Id,
            to = message.To,
            subject = message.Subject,
            body = message.Body,
            resetUrl = message.ResetUrl,
            sentAt = DateTimeOffset.FromUnixTimeSeconds(message.SentUnix)
        });
        return Ok(new { messages });
    }

    private object Session(Authenticated authenticated)
    {
        return new
        {
            token = _tokens.Create(authenticated.User, authenticated.PasswordVersion),
            user = authenticated.User
        };
    }
}

public sealed class RegisterRequest
{
    public string? Name { get; set; }

    public string? Email { get; set; }

    public string? Password { get; set; }
}

public sealed class LoginRequest
{
    public string? Email { get; set; }

    public string? Password { get; set; }
}

public sealed class ForgotPasswordRequest
{
    public string? Email { get; set; }
}

public sealed class ResetPasswordRequest
{
    public string? Token { get; set; }

    public string? Password { get; set; }
}
