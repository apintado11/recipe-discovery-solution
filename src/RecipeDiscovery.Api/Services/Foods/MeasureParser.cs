using System.Globalization;
using System.Text.RegularExpressions;

namespace RecipeDiscovery.Api.Services.Foods;

/// <summary>
/// Turns TheMealDB's free-text measures ("200g", "1 ½ cups", "2 large", "pinch") into grams.
/// Anything it cannot read falls back to one typical unit of the food.
/// </summary>
public static partial class MeasureParser
{
    private const double MaxGrams = 3000;

    public static double ToGrams(string? measure, Food food)
    {
        var text = Normalize(measure);

        var explicitWeight = ExplicitWeight().Match(text);
        if (explicitWeight.Success)
        {
            var value = Number(explicitWeight.Groups["n"].Value);
            var gramsPerUnit = explicitWeight.Groups["u"].Value[0] switch
            {
                'k' => 1000,
                'o' => 28.35,
                'l' or 'p' => 453.6,
                _ => 1.0
            };
            return Clamp(value * gramsPerUnit);
        }

        var quantity = Quantity().Match(text);
        if (!quantity.Success)
        {
            return Clamp(Unquantified(text, food));
        }

        var amount = ReadQuantity(quantity);
        var rest = text[(quantity.Index + quantity.Length)..];

        var range = RangeTail().Match(rest);
        if (range.Success)
        {
            amount = (amount + Number(range.Groups["n"].Value)) / 2;
            rest = rest[range.Length..];
        }

        rest = rest.Trim();
        var size = 1.0;
        var sizeWord = SizeWord().Match(rest);
        if (sizeWord.Success)
        {
            size = sizeWord.Groups["s"].Value switch
            {
                "large" or "big" => 1.3,
                "small" => 0.7,
                _ => 1.0
            };
            rest = rest[sizeWord.Length..].Trim();
        }

        return Clamp(amount * UnitGrams(rest, food) * size);
    }

    private static double UnitGrams(string unit, Food food)
    {
        double Millilitres(double ml) => ml * food.Density;

        if (Starts(unit, "kg", "kilo")) return 1000;
        if (Starts(unit, "mg")) return 0.001;
        if (Starts(unit, "ml", "millilit")) return Millilitres(1);
        if (Word(unit, "l", "litre", "litres", "liter", "liters")) return Millilitres(1000);
        if (Word(unit, "g", "gr", "gm", "gram", "grams")) return 1;
        if (Starts(unit, "fl oz", "fl. oz", "floz")) return Millilitres(29.57);
        if (Word(unit, "oz", "ounce", "ounces")) return 28.35;
        if (Word(unit, "lb", "lbs", "pound", "pounds")) return 453.6;
        if (Word(unit, "cup", "cups", "c")) return Millilitres(240);
        if (Word(unit, "tbsp", "tbs", "tbls", "tblsp", "tablespoon", "tablespoons", "tbsps", "tb")) return Millilitres(15);
        if (Word(unit, "tsp", "tsps", "teaspoon", "teaspoons", "ts")) return Millilitres(5);
        if (Starts(unit, "pinch", "dash")) return 0.4;
        if (Starts(unit, "handful")) return 30;
        if (Starts(unit, "bunch")) return 40;
        if (Starts(unit, "knob")) return 15;
        if (Starts(unit, "clove")) return 4;
        if (Starts(unit, "sprig")) return 1;
        if (Starts(unit, "can", "tin")) return 400;
        if (Starts(unit, "pack", "pkg")) return 250;
        if (Starts(unit, "slice")) return Math.Min(food.PieceGrams, 30);
        if (Starts(unit, "stick")) return food.Group == FoodGroup.FatsAndOils ? 113 : food.PieceGrams;
        return food.PieceGrams;
    }

    private static double Unquantified(string text, Food food)
    {
        if (ContainsAny(text, "pinch", "dash", "taste", "sprinkl", "garnish", "season"))
        {
            return 1;
        }

        if (ContainsAny(text, "drizzle"))
        {
            return 7;
        }

        if (ContainsAny(text, "frying", "greasing", "brushing"))
        {
            return 14;
        }

        if (ContainsAny(text, "handful"))
        {
            return 30;
        }

        return food.Group switch
        {
            FoodGroup.Seasoning => 2,
            FoodGroup.FatsAndOils => 14,
            _ => food.PieceGrams
        };
    }

    private static string Normalize(string? measure)
    {
        var text = (measure ?? "").ToLowerInvariant().Trim();
        return text
            .Replace("½", " 1/2", StringComparison.Ordinal)
            .Replace("¼", " 1/4", StringComparison.Ordinal)
            .Replace("¾", " 3/4", StringComparison.Ordinal)
            .Replace("⅓", " 1/3", StringComparison.Ordinal)
            .Replace("⅔", " 2/3", StringComparison.Ordinal)
            .Replace("⅛", " 1/8", StringComparison.Ordinal)
            .Trim();
    }

    private static double ReadQuantity(Match match)
    {
        if (match.Groups["fn"].Success && !match.Groups["w"].Success)
        {
            return Fraction(match.Groups["fn"].Value, match.Groups["fd"].Value);
        }

        var whole = Number(match.Groups["w"].Value);
        return match.Groups["fn"].Success
            ? whole + Fraction(match.Groups["fn"].Value, match.Groups["fd"].Value)
            : whole;
    }

    private static double Fraction(string numerator, string denominator)
    {
        var bottom = Number(denominator);
        return bottom == 0 ? 0 : Number(numerator) / bottom;
    }

    private static double Number(string value)
    {
        return double.TryParse(value.Replace(',', '.'), NumberStyles.Float, CultureInfo.InvariantCulture, out var number)
            ? number
            : 0;
    }

    private static double Clamp(double grams) => Math.Clamp(grams, 0, MaxGrams);

    private static bool Starts(string unit, params string[] prefixes) =>
        prefixes.Any(prefix => unit.StartsWith(prefix, StringComparison.Ordinal));

    private static bool Word(string unit, params string[] words)
    {
        var first = UnitWord().Match(unit).Value;
        return words.Contains(first, StringComparer.Ordinal);
    }

    private static bool ContainsAny(string text, params string[] parts) =>
        parts.Any(part => text.Contains(part, StringComparison.Ordinal));

    // A weight anywhere in the text wins, so "1 (12 oz.) bag" reads as 12 oz. The lookbehind skips
    // the denominator of a fraction ("1/2 lb" is handled as a quantity plus a unit instead).
    [GeneratedRegex(@"(?<![\d/.,])(?<n>\d+(?:[.,]\d+)?)\s*(?<u>kg|kilograms?|g|grams?|gr|gm|oz|ounces?|lbs?|pounds?)\b")]
    private static partial Regex ExplicitWeight();

    [GeneratedRegex(@"(?<fn>\d+)\s*/\s*(?<fd>\d+)|(?<w>\d+(?:[.,]\d+)?)(?:\s+(?<fn>\d+)/(?<fd>\d+))?")]
    private static partial Regex Quantity();

    [GeneratedRegex(@"^\s*(?:-|–|to)\s*(?<n>\d+(?:[.,]\d+)?)")]
    private static partial Regex RangeTail();

    [GeneratedRegex(@"^(?<s>large|big|medium|small)\b")]
    private static partial Regex SizeWord();

    [GeneratedRegex(@"^[a-z]+")]
    private static partial Regex UnitWord();
}
