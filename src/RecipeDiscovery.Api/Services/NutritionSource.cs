using RecipeDiscovery.Api.Contracts;
using RecipeDiscovery.Api.Services.Foods;

namespace RecipeDiscovery.Api.Services;

public sealed class NutritionFacts
{
    public required double Calories { get; init; }

    public required double Protein { get; init; }

    public required double Carbs { get; init; }

    public required double Fat { get; init; }

    public required double Fiber { get; init; }

    public required double Sugar { get; init; }

    /// <summary>Milligrams.</summary>
    public required double Sodium { get; init; }
}

/// <summary>Share of calories from each macro, in percent.</summary>
public sealed class MacroSplit
{
    public required double ProteinPercent { get; init; }

    public required double CarbsPercent { get; init; }

    public required double FatPercent { get; init; }
}

public sealed class NutritionHighlight
{
    public required string Label { get; init; }

    public required bool Positive { get; init; }
}

public sealed class FoodGroupShare
{
    public required FoodGroup Group { get; init; }

    public required double Grams { get; init; }

    public required double Percent { get; init; }
}

public sealed class IngredientNutrition
{
    public required string Name { get; init; }

    public required string Measure { get; init; }

    public required double Grams { get; init; }

    public required double Calories { get; init; }

    public required double Protein { get; init; }

    public required double Carbs { get; init; }

    public required double Fat { get; init; }

    public required FoodGroup Group { get; init; }

    /// <summary>False when the ingredient was not in the food table and an average was used.</summary>
    public required bool Matched { get; init; }
}

/// <summary>
/// Whole-recipe totals sit at the top level; <see cref="PerServing"/> and <see cref="DailyValues"/>
/// divide them by the estimated <see cref="Servings"/>.
/// </summary>
public sealed class Nutrition
{
    public required double Calories { get; init; }

    public required double Protein { get; init; }

    public required double Carbs { get; init; }

    public required double Fat { get; init; }

    public required double Fiber { get; init; }

    public required double Sugar { get; init; }

    public required double Sodium { get; init; }

    public required int Servings { get; init; }

    public required NutritionFacts PerServing { get; init; }

    /// <summary>Percent of a 2,000 kcal reference diet, per serving.</summary>
    public required NutritionFacts DailyValues { get; init; }

    public required MacroSplit Macros { get; init; }

    /// <summary>0–100. Rewards protein, fiber, and produce; penalises sugar, sodium, and very fatty plates.</summary>
    public required int HealthScore { get; init; }

    public required string Grade { get; init; }

    public required IReadOnlyList<NutritionHighlight> Highlights { get; init; }

    public required IReadOnlyList<FoodGroupShare> FoodGroups { get; init; }

    public required IReadOnlyList<IngredientNutrition> Ingredients { get; init; }

    public required int MatchedIngredients { get; init; }

    public required int TotalIngredients { get; init; }
}

public interface INutritionSource
{
    Nutrition Estimate(Recipe recipe);
}

/// <summary>
/// Mock nutrition source used only by the GraphQL field resolver. TheMealDB has no nutrition data, so each
/// ingredient's measure is converted to grams and priced against a per-100 g food table.
/// </summary>
public sealed class NutritionSource : INutritionSource
{
    private static readonly NutritionFacts Reference = new()
    {
        Calories = 2000,
        Protein = 50,
        Carbs = 275,
        Fat = 78,
        Fiber = 28,
        Sugar = 50,
        Sodium = 2300
    };

    public Nutrition Estimate(Recipe recipe)
    {
        var lines = recipe.Ingredients.Select(Price).ToList();

        var totals = new NutritionFacts
        {
            Calories = Math.Round(lines.Sum(line => line.Calories)),
            Protein = Round(lines.Sum(line => line.Protein)),
            Carbs = Round(lines.Sum(line => line.Carbs)),
            Fat = Round(lines.Sum(line => line.Fat)),
            Fiber = Round(lines.Sum(line => line.Fiber)),
            Sugar = Round(lines.Sum(line => line.Sugar)),
            Sodium = Math.Round(lines.Sum(line => line.Sodium))
        };

        var totalGrams = lines.Sum(line => line.Grams);
        var servings = EstimateServings(totalGrams, totals.Calories, lines.Count);
        var perServing = Divide(totals, servings);
        var macros = Split(perServing);
        var groups = FoodGroups(lines);
        var produceShare = ProduceShare(lines);
        var score = Score(perServing, macros, produceShare);

        return new Nutrition
        {
            Calories = totals.Calories,
            Protein = totals.Protein,
            Carbs = totals.Carbs,
            Fat = totals.Fat,
            Fiber = totals.Fiber,
            Sugar = totals.Sugar,
            Sodium = totals.Sodium,
            Servings = servings,
            PerServing = perServing,
            DailyValues = Percent(perServing),
            Macros = macros,
            HealthScore = score,
            Grade = Grade(score),
            Highlights = Highlights(perServing, macros, produceShare),
            FoodGroups = groups,
            Ingredients = lines.Select(line => line.Public).ToList(),
            MatchedIngredients = lines.Count(line => line.Public.Matched),
            TotalIngredients = lines.Count
        };
    }

    private static Line Price(Ingredient ingredient)
    {
        var match = FoodTable.Find(ingredient.Name);
        var food = match ?? FoodTable.Unknown;
        var grams = MeasureParser.ToGrams(ingredient.Measure, food);
        var factor = grams / 100;

        return new Line(
            grams,
            food.Calories * factor,
            food.Protein * factor,
            food.Carbs * factor,
            food.Fat * factor,
            food.Fiber * factor,
            food.Sugar * factor,
            food.SodiumMg * factor,
            food.Group,
            new IngredientNutrition
            {
                Name = ingredient.Name,
                Measure = ingredient.Measure,
                Grams = Math.Round(grams),
                Calories = Math.Round(food.Calories * factor),
                Protein = Round(food.Protein * factor),
                Carbs = Round(food.Carbs * factor),
                Fat = Round(food.Fat * factor),
                Group = food.Group,
                Matched = match is not null
            });
    }

    private static int EstimateServings(double grams, double calories, int ingredientCount)
    {
        if (ingredientCount == 0)
        {
            return 1;
        }

        var byWeight = Math.Round(grams / 400);
        var byEnergy = Math.Round(calories / 650);
        return (int)Math.Clamp(Math.Max(byWeight, byEnergy), 1, 8);
    }

    private static NutritionFacts Divide(NutritionFacts totals, int servings) => new()
    {
        Calories = Math.Round(totals.Calories / servings),
        Protein = Round(totals.Protein / servings),
        Carbs = Round(totals.Carbs / servings),
        Fat = Round(totals.Fat / servings),
        Fiber = Round(totals.Fiber / servings),
        Sugar = Round(totals.Sugar / servings),
        Sodium = Math.Round(totals.Sodium / servings)
    };

    private static NutritionFacts Percent(NutritionFacts serving) => new()
    {
        Calories = Math.Round(serving.Calories / Reference.Calories * 100),
        Protein = Math.Round(serving.Protein / Reference.Protein * 100),
        Carbs = Math.Round(serving.Carbs / Reference.Carbs * 100),
        Fat = Math.Round(serving.Fat / Reference.Fat * 100),
        Fiber = Math.Round(serving.Fiber / Reference.Fiber * 100),
        Sugar = Math.Round(serving.Sugar / Reference.Sugar * 100),
        Sodium = Math.Round(serving.Sodium / Reference.Sodium * 100)
    };

    private static MacroSplit Split(NutritionFacts serving)
    {
        var protein = serving.Protein * 4;
        var carbs = serving.Carbs * 4;
        var fat = serving.Fat * 9;
        var energy = protein + carbs + fat;
        if (energy <= 0)
        {
            return new MacroSplit { ProteinPercent = 0, CarbsPercent = 0, FatPercent = 0 };
        }

        return new MacroSplit
        {
            ProteinPercent = Math.Round(protein / energy * 100),
            CarbsPercent = Math.Round(carbs / energy * 100),
            FatPercent = Math.Round(fat / energy * 100)
        };
    }

    private static IReadOnlyList<FoodGroupShare> FoodGroups(IReadOnlyList<Line> lines)
    {
        var total = lines.Sum(line => line.Grams);
        if (total <= 0)
        {
            return [];
        }

        return lines
            .GroupBy(line => line.Group)
            .Select(group => new FoodGroupShare
            {
                Group = group.Key,
                Grams = Math.Round(group.Sum(line => line.Grams)),
                Percent = Math.Round(group.Sum(line => line.Grams) / total * 100)
            })
            .Where(share => share.Grams > 0)
            .OrderByDescending(share => share.Grams)
            .ToList();
    }

    /// <summary>Vegetables, fruit, and legumes as a share of solid ingredients (stock and water excluded).</summary>
    private static double ProduceShare(IReadOnlyList<Line> lines)
    {
        var solids = lines.Where(line => line.Group != FoodGroup.Other).Sum(line => line.Grams);
        if (solids <= 0)
        {
            return 0;
        }

        var produce = lines
            .Where(line => line.Group is FoodGroup.Vegetables or FoodGroup.Fruit or FoodGroup.Legumes)
            .Sum(line => line.Grams);
        return produce / solids;
    }

    private static int Score(NutritionFacts serving, MacroSplit macros, double produceShare)
    {
        double score = 50;
        score += Math.Min(20, macros.ProteinPercent * 0.8);
        score += Math.Min(15, serving.Fiber * 2.5);
        score += Math.Min(15, produceShare * 30);
        score -= Math.Min(20, Math.Max(0, serving.Sugar - 10));
        score -= Math.Min(15, Math.Max(0, serving.Sodium - 600) / 40);
        score -= Math.Min(10, Math.Max(0, macros.FatPercent - 40) * 0.5);
        if (serving.Calories > 1000)
        {
            score -= 10;
        }
        else if (serving.Calories is >= 250 and <= 750)
        {
            score += 5;
        }

        return (int)Math.Clamp(Math.Round(score), 0, 100);
    }

    private static string Grade(int score) => score switch
    {
        >= 80 => "A",
        >= 65 => "B",
        >= 50 => "C",
        >= 35 => "D",
        _ => "E"
    };

    private static IReadOnlyList<NutritionHighlight> Highlights(NutritionFacts serving, MacroSplit macros, double produceShare)
    {
        var highlights = new List<NutritionHighlight>();
        void Add(bool when, string label, bool positive)
        {
            if (when)
            {
                highlights.Add(new NutritionHighlight { Label = label, Positive = positive });
            }
        }

        Add(serving.Protein >= 25 || macros.ProteinPercent >= 30, "High protein", true);
        Add(serving.Fiber >= 5, "Good fiber", true);
        Add(produceShare >= 0.4, "Veg-forward", true);
        Add(serving.Carbs <= 20, "Low carb", true);
        Add(serving.Sugar <= 5, "Low sugar", true);
        Add(serving.Calories <= 450, "Light", true);
        Add(serving.Sodium >= 1000, "High sodium", false);
        Add(serving.Sugar >= 25, "High sugar", false);
        Add(macros.FatPercent >= 50, "High fat", false);
        Add(serving.Calories >= 900, "Calorie dense", false);
        return highlights;
    }

    private static double Round(double value) => Math.Round(value, 1);

    private sealed record Line(
        double Grams,
        double Calories,
        double Protein,
        double Carbs,
        double Fat,
        double Fiber,
        double Sugar,
        double Sodium,
        FoodGroup Group,
        IngredientNutrition Public);
}
