using RecipeDiscovery.Api.MealDb;
using RecipeDiscovery.Api.Services;

namespace RecipeDiscovery.Api.Tests;

public sealed class RecipeMapperTests
{
    [Theory]
    [InlineData(3, 40, "Easy")]
    [InlineData(9, 40, "Medium")]
    [InlineData(12, 40, "Hard")]
    public void Difficulty_FollowsEstimate(int ingredientCount, int instructionLength, string expected)
    {
        var meal = new MealDbMeal(
            "1",
            "Stew",
            "Nowhere",
            null,
            new string('a', instructionLength),
            null,
            Enumerable.Range(1, ingredientCount)
                .Select(index => new IngredientLine($"Item {index}", "1"))
                .ToList());

        var recipe = RecipeMapper.ToRecipe(meal);

        Assert.Equal(expected, recipe.Difficulty);
        Assert.Equal(ingredientCount, recipe.Ingredients.Count);
    }

    [Fact]
    public void Cuisine_UsesAreaBeforeCountry()
    {
        var withArea = new MealDbMeal("1", "Casserole", "Japanese", "Japan", "", null, []);
        var countryOnly = new MealDbMeal("2", "Acaraje", null, "Brazil", "", null, []);

        Assert.Equal("Japanese", RecipeMapper.ToRecipe(withArea).Cuisine);
        Assert.Equal("Brazil", RecipeMapper.ToRecipe(countryOnly).Cuisine);
    }
}
