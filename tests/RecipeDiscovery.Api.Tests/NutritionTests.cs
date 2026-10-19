using RecipeDiscovery.Api.Contracts;
using RecipeDiscovery.Api.Services;
using RecipeDiscovery.Api.Services.Foods;

namespace RecipeDiscovery.Api.Tests;

public sealed class NutritionTests
{
    private static readonly Food Flour = FoodTable.Find("Plain Flour")!;
    private static readonly Food Egg = FoodTable.Find("Eggs")!;
    private static readonly Food Salt = FoodTable.Find("Salt")!;

    [Theory]
    [InlineData("200g", 200)]
    [InlineData("200 g", 200)]
    [InlineData("1.5kg", 1500)]
    [InlineData("1 tin (400g)", 400)]
    [InlineData("1 cup", 127.2)]
    [InlineData("1/2 cup", 63.6)]
    [InlineData("1 ½ cups", 190.8)]
    [InlineData("2 tbsp", 15.9)]
    [InlineData("1 tsp", 2.7)]
    [InlineData("4 oz", 113.4)]
    [InlineData("1 (12 oz.)", 340.2)]
    [InlineData("1/2 lb", 226.8)]
    public void ToGrams_ReadsWeightsAndVolumes(string measure, double grams)
    {
        Assert.Equal(grams, MeasureParser.ToGrams(measure, Flour), 1);
    }

    [Theory]
    [InlineData("2", 100)]
    [InlineData("2 large", 130)]
    [InlineData("2-4", 150)]
    [InlineData("", 50)]
    public void ToGrams_CountsUseTheFoodsUnitWeight(string measure, double grams)
    {
        Assert.Equal(grams, MeasureParser.ToGrams(measure, Egg), 1);
    }

    [Theory]
    [InlineData("pinch", 1)]
    [InlineData("to taste", 1)]
    [InlineData("1 pinch", 0.4)]
    public void ToGrams_SeasoningStaysSmall(string measure, double grams)
    {
        Assert.Equal(grams, MeasureParser.ToGrams(measure, Salt), 1);
    }

    [Theory]
    [InlineData("Eggplant", "eggplant")]
    [InlineData("Butter Beans", "butter bean")]
    [InlineData("Chicken Breasts", "chicken breast")]
    [InlineData("Black Pepper", "black pepper")]
    [InlineData("Cornstarch", "cornstarch")]
    [InlineData("Stir-fry vegetables", "vegetables")]
    [InlineData("Vegetable Oil", "oil")]
    public void Find_PrefersTheLongestMatch(string ingredient, string key)
    {
        Assert.Equal(key, FoodTable.Find(ingredient)?.Key);
    }

    [Fact]
    public void Estimate_SplitsIntoServingsAndFlagsAProteinDish()
    {
        var recipe = new Recipe
        {
            Id = "1",
            Name = "Chicken and broccoli",
            Description = "",
            Cuisine = "Test",
            PreparationTimeMinutes = 20,
            Difficulty = "Easy",
            Ingredients =
            [
                new Ingredient { Name = "Chicken Breast", Measure = "600g" },
                new Ingredient { Name = "Broccoli", Measure = "400g" },
                new Ingredient { Name = "Olive Oil", Measure = "1 tbsp" },
                new Ingredient { Name = "Dragonfruit dust", Measure = "1 tsp" }
            ]
        };

        var nutrition = new NutritionSource().Estimate(recipe);

        Assert.Equal(3, nutrition.Servings);
        Assert.Equal(3, nutrition.MatchedIngredients);
        Assert.Equal(4, nutrition.TotalIngredients);
        Assert.Contains(nutrition.Highlights, highlight => highlight.Label == "High protein" && highlight.Positive);
        Assert.True(nutrition.HealthScore >= 80, $"score was {nutrition.HealthScore}");
        Assert.Equal("A", nutrition.Grade);
        Assert.Equal(FoodGroup.Protein, nutrition.FoodGroups[0].Group);
    }
}
