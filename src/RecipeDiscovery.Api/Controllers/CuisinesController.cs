using Microsoft.AspNetCore.Mvc;
using RecipeDiscovery.Api.Services;

namespace RecipeDiscovery.Api.Controllers;

[ApiController]
[Route("cuisines")]
public sealed class CuisinesController : ControllerBase
{
    private readonly IRecipeService _recipes;

    public CuisinesController(IRecipeService recipes)
    {
        _recipes = recipes;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<string>>> List(CancellationToken cancellationToken)
    {
        return Ok(await _recipes.GetCuisinesAsync(cancellationToken));
    }
}
