using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RecipeDiscovery.Api.Contracts;
using RecipeDiscovery.Api.Services;

namespace RecipeDiscovery.Api.Controllers;

[ApiController]
[Authorize]
[Route("users")]
public sealed class UsersController : ControllerBase
{
    private readonly IFavoriteService _favorites;

    public UsersController(IFavoriteService favorites)
    {
        _favorites = favorites;
    }

    [HttpGet("{userId}/favorites")]
    public async Task<ActionResult<IReadOnlyList<Recipe>>> Get(string userId, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await _favorites.GetFavoritesAsync(userId, CallerId(), cancellationToken));
        }
        catch (ForbiddenException exception)
        {
            return Problem(
                statusCode: StatusCodes.Status403Forbidden,
                title: "Forbidden",
                detail: exception.Message);
        }
        catch (NotFoundException exception)
        {
            return Problem(
                statusCode: StatusCodes.Status404NotFound,
                title: "Not found",
                detail: exception.Message);
        }
    }

    [HttpPost("{userId}/favorites")]
    public async Task<ActionResult<IReadOnlyList<Recipe>>> Add(
        string userId,
        [FromBody] AddFavoriteRequest? request,
        CancellationToken cancellationToken)
    {
        if (request is null || string.IsNullOrWhiteSpace(request.RecipeId))
        {
            return Problem(
                statusCode: StatusCodes.Status400BadRequest,
                title: "Recipe id is required");
        }

        try
        {
            var favorites = await _favorites.AddFavoriteAsync(userId, CallerId(), request.RecipeId, cancellationToken);
            return Ok(favorites);
        }
        catch (ForbiddenException exception)
        {
            return Problem(
                statusCode: StatusCodes.Status403Forbidden,
                title: "Forbidden",
                detail: exception.Message);
        }
        catch (NotFoundException exception)
        {
            return Problem(
                statusCode: StatusCodes.Status404NotFound,
                title: "Not found",
                detail: exception.Message);
        }
    }

    private string CallerId()
    {
        return User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "";
    }
}
