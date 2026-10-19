using Microsoft.AspNetCore.Mvc;
using RecipeDiscovery.Api.Contracts;
using RecipeDiscovery.Api.Services;

namespace RecipeDiscovery.Api.Controllers;

[ApiController]
[Route("recipes")]
public sealed class RecipesController : ControllerBase
{
    private readonly IRecipeService _recipes;

    public RecipesController(IRecipeService recipes)
    {
        _recipes = recipes;
    }

    [HttpGet]
    public async Task<ActionResult<RecipePage>> List(
        [FromQuery] string? cuisine,
        [FromQuery] string? ingredient,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = RecipeQuery.DefaultPageSize,
        CancellationToken cancellationToken = default)
    {
        var result = await _recipes.SearchAsync(
            RecipeQuery.Create(cuisine, ingredient, search, page, pageSize),
            cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Recipe>> Get(string id, CancellationToken cancellationToken)
    {
        var recipe = await _recipes.GetByIdAsync(id, cancellationToken);
        if (recipe is null)
        {
            return Problem(
                statusCode: StatusCodes.Status404NotFound,
                title: "Recipe not found",
                detail: $"Recipe '{id}' was not found.");
        }

        return Ok(recipe);
    }
}
