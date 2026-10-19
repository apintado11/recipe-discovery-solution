namespace RecipeDiscovery.Api.Services.Foods;

public enum FoodGroup
{
    Protein,
    Dairy,
    Grains,
    Vegetables,
    Fruit,
    Legumes,
    FatsAndOils,
    Sweets,
    Seasoning,
    Other
}

/// <summary>
/// Nutrients per 100 g. <see cref="PieceGrams"/> is the weight of one unit when a measure is a bare count
/// ("2 eggs"), and <see cref="Density"/> converts volume to weight (grams per millilitre).
/// </summary>
public sealed record Food(
    string Key,
    FoodGroup Group,
    double Calories,
    double Protein,
    double Carbs,
    double Fat,
    double Fiber,
    double Sugar,
    double SodiumMg,
    double PieceGrams,
    double Density = 1.0);

public static class FoodTable
{
    /// <summary>Used when no row matches. Values sit near the middle of a mixed pantry.</summary>
    public static readonly Food Unknown = new("unknown", FoodGroup.Other, 100, 4, 12, 4, 2, 3, 100, 50, 0.8);

    public static readonly Food[] Rows =
    [
        new("chicken breast", FoodGroup.Protein, 165, 31, 0, 3.6, 0, 0, 74, 170),
        new("chicken thigh", FoodGroup.Protein, 209, 26, 0, 10.9, 0, 0, 84, 110),
        new("chicken stock", FoodGroup.Other, 7, 1, 0.4, 0.2, 0, 0.3, 340, 250),
        new("chicken", FoodGroup.Protein, 190, 27, 0, 9, 0, 0, 80, 200),
        new("turkey", FoodGroup.Protein, 160, 29, 0, 4.5, 0, 0, 70, 150),
        new("minced beef", FoodGroup.Protein, 250, 26, 0, 15, 0, 0, 72, 125),
        new("beef stock", FoodGroup.Other, 7, 1, 0.4, 0.2, 0, 0.3, 340, 250),
        new("beef", FoodGroup.Protein, 250, 26, 0, 15, 0, 0, 72, 150),
        new("lamb", FoodGroup.Protein, 282, 25, 0, 20, 0, 0, 72, 150),
        new("bacon", FoodGroup.Protein, 541, 37, 1.4, 42, 0, 0, 1717, 15),
        new("sausage", FoodGroup.Protein, 300, 12, 3, 27, 0, 1, 800, 60),
        new("chorizo", FoodGroup.Protein, 455, 24, 2, 38, 0, 1, 1240, 60),
        new("ham", FoodGroup.Protein, 145, 21, 1.5, 6, 0, 0, 1200, 30),
        new("pork", FoodGroup.Protein, 242, 27, 0, 14, 0, 0, 62, 150),
        new("salmon", FoodGroup.Protein, 208, 20, 0, 13, 0, 0, 59, 150),
        new("tuna", FoodGroup.Protein, 132, 28, 0, 1, 0, 0, 50, 140),
        new("prawn", FoodGroup.Protein, 99, 24, 0.2, 0.3, 0, 0, 111, 15),
        new("shrimp", FoodGroup.Protein, 99, 24, 0.2, 0.3, 0, 0, 111, 15),
        new("saltfish", FoodGroup.Protein, 290, 63, 0, 2.4, 0, 0, 7000, 100),
        new("cod", FoodGroup.Protein, 82, 18, 0, 0.7, 0, 0, 54, 150),
        new("fish", FoodGroup.Protein, 100, 20, 0, 2, 0, 0, 60, 150),
        new("tofu", FoodGroup.Protein, 76, 8, 1.9, 4.8, 0.3, 0.6, 7, 100),
        new("egg", FoodGroup.Protein, 143, 12.6, 0.7, 9.5, 0, 0.4, 142, 50),

        new("coconut milk", FoodGroup.FatsAndOils, 230, 2.3, 6, 24, 2.2, 3.3, 15, 400),
        new("buttermilk", FoodGroup.Dairy, 40, 3.3, 4.8, 0.9, 0, 4.8, 105, 240, 1.03),
        new("milk", FoodGroup.Dairy, 61, 3.2, 4.8, 3.3, 0, 5, 43, 240, 1.03),
        new("cream cheese", FoodGroup.Dairy, 342, 6, 4, 34, 0, 3, 321, 30),
        new("cream", FoodGroup.Dairy, 340, 2, 3, 36, 0, 3, 30, 240),
        new("yogurt", FoodGroup.Dairy, 61, 3.5, 4.7, 3.3, 0, 4.7, 46, 150),
        new("yoghurt", FoodGroup.Dairy, 61, 3.5, 4.7, 3.3, 0, 4.7, 46, 150),
        new("butter", FoodGroup.FatsAndOils, 717, 0.9, 0.1, 81, 0, 0.1, 11, 15, 0.96),
        new("parmesan", FoodGroup.Dairy, 431, 38, 4, 29, 0, 1, 1529, 20, 0.45),
        new("mozzarella", FoodGroup.Dairy, 280, 28, 3, 17, 0, 1, 627, 125, 0.45),
        new("feta", FoodGroup.Dairy, 264, 14, 4, 21, 0, 4, 917, 30, 0.45),
        new("cheese", FoodGroup.Dairy, 402, 25, 1.3, 33, 0, 0.5, 621, 30, 0.45),

        new("olive oil", FoodGroup.FatsAndOils, 884, 0, 0, 100, 0, 0, 2, 14, 0.92),
        new("oil", FoodGroup.FatsAndOils, 884, 0, 0, 100, 0, 0, 0, 14, 0.92),
        new("peanut butter", FoodGroup.FatsAndOils, 588, 25, 20, 50, 6, 9, 17, 16, 1.09),
        new("almond", FoodGroup.FatsAndOils, 579, 21, 22, 50, 12.5, 4.4, 1, 1.2, 0.6),
        new("peanut", FoodGroup.FatsAndOils, 567, 26, 16, 49, 8.5, 4, 18, 1, 0.6),
        new("walnut", FoodGroup.FatsAndOils, 654, 15, 14, 65, 6.7, 2.6, 2, 4, 0.5),
        new("avocado", FoodGroup.Fruit, 160, 2, 8.5, 14.7, 6.7, 0.7, 7, 150),

        new("cornstarch", FoodGroup.Grains, 381, 0.3, 91, 0.1, 0.9, 0, 9, 8, 0.54),
        new("corn starch", FoodGroup.Grains, 381, 0.3, 91, 0.1, 0.9, 0, 9, 8, 0.54),
        new("cornflour", FoodGroup.Grains, 381, 0.3, 91, 0.1, 0.9, 0, 9, 8, 0.54),
        new("flour", FoodGroup.Grains, 364, 10, 76, 1, 2.7, 0.3, 2, 30, 0.53),
        new("rice", FoodGroup.Grains, 360, 7, 79, 0.6, 1.3, 0.1, 5, 75, 0.8),
        new("spaghetti", FoodGroup.Grains, 371, 13, 75, 1.5, 3.2, 2.7, 6, 75, 0.45),
        new("pasta", FoodGroup.Grains, 371, 13, 75, 1.5, 3.2, 2.7, 6, 75, 0.45),
        new("noodle", FoodGroup.Grains, 371, 12, 75, 2, 3, 2, 20, 75, 0.45),
        new("oats", FoodGroup.Grains, 389, 17, 66, 7, 10.6, 1, 2, 40, 0.38),
        new("breadcrumbs", FoodGroup.Grains, 395, 13, 72, 5, 4.5, 6, 732, 30, 0.45),
        new("bread", FoodGroup.Grains, 265, 9, 49, 3.2, 2.7, 5, 491, 35),
        new("tortilla", FoodGroup.Grains, 310, 8, 52, 7.5, 3.5, 2, 600, 45),
        new("couscous", FoodGroup.Grains, 376, 13, 77, 0.6, 5, 0, 10, 60, 0.75),

        new("sweet potato", FoodGroup.Vegetables, 86, 1.6, 20, 0.1, 3, 4.2, 55, 130),
        new("potato", FoodGroup.Vegetables, 77, 2, 17, 0.1, 2.2, 0.8, 6, 170),
        new("spring onion", FoodGroup.Vegetables, 32, 1.8, 7.3, 0.2, 2.6, 2.3, 16, 15),
        new("onion", FoodGroup.Vegetables, 40, 1.1, 9.3, 0.1, 1.7, 4.2, 4, 110),
        new("shallot", FoodGroup.Vegetables, 72, 2.5, 17, 0.1, 3.2, 8, 12, 30),
        new("garlic", FoodGroup.Vegetables, 149, 6.4, 33, 0.5, 2.1, 1, 17, 4),
        new("ginger", FoodGroup.Seasoning, 80, 1.8, 18, 0.8, 2, 1.7, 13, 10),
        new("tomato puree", FoodGroup.Vegetables, 82, 4.3, 19, 0.5, 4, 12, 59, 15),
        new("tomato paste", FoodGroup.Vegetables, 82, 4.3, 19, 0.5, 4, 12, 59, 15),
        new("tomato", FoodGroup.Vegetables, 18, 0.9, 3.9, 0.2, 1.2, 2.6, 5, 120),
        new("carrot", FoodGroup.Vegetables, 41, 0.9, 10, 0.2, 2.8, 4.7, 69, 60),
        new("celery", FoodGroup.Vegetables, 16, 0.7, 3, 0.2, 1.6, 1.3, 80, 40),
        new("black pepper", FoodGroup.Seasoning, 251, 10, 64, 3.3, 25, 0.6, 20, 1, 0.5),
        new("chilli powder", FoodGroup.Seasoning, 282, 13, 50, 14, 35, 7, 2867, 2, 0.5),
        new("chili powder", FoodGroup.Seasoning, 282, 13, 50, 14, 35, 7, 2867, 2, 0.5),
        new("pepper", FoodGroup.Vegetables, 31, 1, 6, 0.3, 2.1, 4.2, 4, 120),
        new("chilli", FoodGroup.Vegetables, 40, 1.9, 9, 0.4, 1.5, 5, 9, 15),
        new("chili", FoodGroup.Vegetables, 40, 1.9, 9, 0.4, 1.5, 5, 9, 15),
        new("spinach", FoodGroup.Vegetables, 23, 2.9, 3.6, 0.4, 2.2, 0.4, 79, 30),
        new("mushroom", FoodGroup.Vegetables, 22, 3.1, 3.3, 0.3, 1, 2, 5, 18),
        new("broccoli", FoodGroup.Vegetables, 34, 2.8, 7, 0.4, 2.6, 1.7, 33, 300),
        new("courgette", FoodGroup.Vegetables, 17, 1.2, 3.1, 0.3, 1, 2.5, 8, 200),
        new("zucchini", FoodGroup.Vegetables, 17, 1.2, 3.1, 0.3, 1, 2.5, 8, 200),
        new("aubergine", FoodGroup.Vegetables, 25, 1, 6, 0.2, 3, 3.5, 2, 300),
        new("eggplant", FoodGroup.Vegetables, 25, 1, 6, 0.2, 3, 3.5, 2, 300),
        new("cabbage", FoodGroup.Vegetables, 25, 1.3, 5.8, 0.1, 2.5, 3.2, 18, 500),
        new("lettuce", FoodGroup.Vegetables, 15, 1.4, 2.9, 0.2, 1.3, 0.8, 28, 300),
        new("cucumber", FoodGroup.Vegetables, 15, 0.7, 3.6, 0.1, 0.5, 1.7, 2, 300),
        new("eyed peas", FoodGroup.Legumes, 116, 7.7, 21, 0.5, 6.5, 3.3, 4, 100),
        new("peas", FoodGroup.Vegetables, 81, 5.4, 14, 0.4, 5.7, 5.7, 5, 80),
        new("sweetcorn", FoodGroup.Vegetables, 86, 3.3, 19, 1.4, 2.7, 6.3, 15, 80),
        new("corn", FoodGroup.Vegetables, 86, 3.3, 19, 1.4, 2.7, 6.3, 15, 80),

        new("vegetables", FoodGroup.Vegetables, 35, 2, 7, 0.3, 2.5, 3, 30, 150),

        new("chickpea", FoodGroup.Legumes, 164, 8.9, 27, 2.6, 7.6, 4.8, 7, 240),
        new("lentil", FoodGroup.Legumes, 116, 9, 20, 0.4, 7.9, 1.8, 2, 100, 0.85),
        new("butter bean", FoodGroup.Legumes, 103, 7, 18, 0.4, 4.6, 1.4, 4, 240),
        new("bean", FoodGroup.Legumes, 127, 8.7, 22.8, 0.5, 6.4, 0.3, 2, 240),

        new("apple", FoodGroup.Fruit, 52, 0.3, 14, 0.2, 2.4, 10, 1, 180),
        new("banana", FoodGroup.Fruit, 89, 1.1, 23, 0.3, 2.6, 12, 1, 120),
        new("lemon", FoodGroup.Fruit, 29, 1.1, 9.3, 0.3, 2.8, 2.5, 2, 60),
        new("lime", FoodGroup.Fruit, 30, 0.7, 10.5, 0.2, 2.8, 1.7, 2, 45),
        new("orange", FoodGroup.Fruit, 47, 0.9, 12, 0.1, 2.4, 9.4, 0, 130),
        new("berr", FoodGroup.Fruit, 50, 0.9, 12, 0.4, 3.5, 7, 1, 5),
        new("raisin", FoodGroup.Fruit, 299, 3.1, 79, 0.5, 3.7, 59, 11, 1, 0.6),

        new("brown sugar", FoodGroup.Sweets, 380, 0.1, 98, 0, 0, 97, 28, 12, 0.9),
        new("icing sugar", FoodGroup.Sweets, 389, 0, 100, 0, 0, 98, 2, 12, 0.5),
        new("sugar", FoodGroup.Sweets, 387, 0, 100, 0, 0, 100, 1, 12, 0.85),
        new("honey", FoodGroup.Sweets, 304, 0.3, 82, 0, 0.2, 82, 4, 21, 1.42),
        new("maple syrup", FoodGroup.Sweets, 260, 0, 67, 0.1, 0, 60, 12, 20, 1.32),
        new("syrup", FoodGroup.Sweets, 300, 0, 77, 0, 0, 70, 30, 20, 1.35),
        new("chocolate", FoodGroup.Sweets, 546, 4.9, 61, 31, 7, 48, 24, 10, 0.6),
        new("cocoa", FoodGroup.Sweets, 228, 20, 58, 14, 37, 1.8, 21, 5, 0.4),
        new("jam", FoodGroup.Sweets, 250, 0.4, 62, 0.1, 1, 49, 30, 20, 1.3),

        new("stock", FoodGroup.Other, 7, 1, 0.4, 0.2, 0, 0.3, 340, 250),
        new("broth", FoodGroup.Other, 7, 1, 0.4, 0.2, 0, 0.3, 340, 250),
        new("water", FoodGroup.Other, 0, 0, 0, 0, 0, 0, 0, 240),
        new("wine", FoodGroup.Other, 83, 0.1, 2.6, 0, 0, 0.6, 5, 150, 0.99),
        new("soy sauce", FoodGroup.Seasoning, 53, 8, 4.9, 0.6, 0.8, 0.4, 5493, 15, 1.1),
        new("fish sauce", FoodGroup.Seasoning, 35, 5, 3.6, 0, 0, 3.6, 7851, 15, 1.2),
        new("vinegar", FoodGroup.Seasoning, 18, 0, 0.04, 0, 0, 0.04, 2, 15, 1.01),
        new("mustard", FoodGroup.Seasoning, 66, 4.4, 5.8, 4, 4, 0.9, 1135, 5, 1.05),
        new("ketchup", FoodGroup.Seasoning, 101, 1.3, 27, 0.1, 0.3, 22, 907, 15, 1.15),
        new("mayonnaise", FoodGroup.FatsAndOils, 680, 1, 0.6, 75, 0, 0.6, 635, 15, 0.95),
        new("salt", FoodGroup.Seasoning, 0, 0, 0, 0, 0, 0, 38758, 1, 1.2),
        new("baking powder", FoodGroup.Seasoning, 53, 0, 28, 0, 0.2, 0, 10600, 4, 0.9),
        new("yeast", FoodGroup.Seasoning, 325, 40, 41, 7.6, 27, 0, 51, 7, 0.6),

        new("parsley", FoodGroup.Seasoning, 36, 3, 6.3, 0.8, 3.3, 0.9, 56, 10, 0.25),
        new("coriander", FoodGroup.Seasoning, 23, 2.1, 3.7, 0.5, 2.8, 0.9, 46, 10, 0.25),
        new("cilantro", FoodGroup.Seasoning, 23, 2.1, 3.7, 0.5, 2.8, 0.9, 46, 10, 0.25),
        new("basil", FoodGroup.Seasoning, 23, 3.2, 2.7, 0.6, 1.6, 0.3, 4, 10, 0.25),
        new("mint", FoodGroup.Seasoning, 70, 3.8, 15, 0.9, 8, 0, 31, 10, 0.25),
        new("thyme", FoodGroup.Seasoning, 101, 5.6, 24, 1.7, 14, 0, 9, 1, 0.3),
        new("rosemary", FoodGroup.Seasoning, 131, 3.3, 21, 5.9, 14, 0, 26, 1, 0.3),
        new("bay lea", FoodGroup.Seasoning, 313, 7.6, 75, 8.4, 26, 0, 23, 0.2, 0.2),
        new("cumin", FoodGroup.Seasoning, 375, 18, 44, 22, 11, 2.3, 168, 2, 0.45),
        new("paprika", FoodGroup.Seasoning, 282, 14, 54, 13, 35, 10, 68, 2, 0.45),
        new("turmeric", FoodGroup.Seasoning, 312, 9.7, 67, 3.3, 23, 3.2, 27, 2, 0.45),
        new("cinnamon", FoodGroup.Seasoning, 247, 4, 81, 1.2, 53, 2.2, 10, 2, 0.45),
        new("spice", FoodGroup.Seasoning, 300, 12, 55, 10, 30, 3, 50, 2, 0.45),
        new("vanilla", FoodGroup.Seasoning, 288, 0.1, 13, 0.1, 0, 13, 9, 4, 0.88)
    ];

    /// <summary>The longest matching key wins, so "eggplant" is not read as "egg".</summary>
    public static Food? Find(string ingredientName)
    {
        var name = ingredientName.Trim().ToLowerInvariant();
        Food? best = null;
        foreach (var row in Rows)
        {
            if (name.Contains(row.Key, StringComparison.Ordinal) && (best is null || row.Key.Length > best.Key.Length))
            {
                best = row;
            }
        }

        return best;
    }
}
