using RecipeDiscovery.Api.Contracts;
using RecipeDiscovery.Api.MealDb;

namespace RecipeDiscovery.Api.Services;

public sealed class RecipeService : IRecipeService
{
    private const int RemoteParallelism = 6;

    private readonly IMealDbClient _mealDb;
    private readonly RecipeCache _cache;
    private readonly ILogger<RecipeService> _logger;
    private readonly SemaphoreSlim _catalogGate = new(1, 1);

    private volatile IReadOnlyList<CatalogEntry>? _catalog;
    private volatile IReadOnlyList<string>? _cuisines;

    public RecipeService(IMealDbClient mealDb, RecipeCache cache, ILogger<RecipeService> logger)
    {
        _mealDb = mealDb;
        _cache = cache;
        _logger = logger;
    }

    public async Task<Recipe?> GetByIdAsync(string id, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(id))
        {
            return null;
        }

        var key = id.Trim();
        if (_cache.TryGet(key, out var cached))
        {
            return cached;
        }

        var gate = _cache.Gate(key);
        await gate.WaitAsync(cancellationToken);
        try
        {
            if (_cache.TryGet(key, out cached))
            {
                return cached;
            }

            var meal = await _mealDb.LookupAsync(key, cancellationToken);
            if (meal is null)
            {
                return null;
            }

            var recipe = RecipeMapper.ToRecipe(meal);
            _cache.Set(recipe);
            _logger.LogInformation("Cached recipe {RecipeId} from TheMealDB", recipe.Id);
            return recipe;
        }
        finally
        {
            gate.Release();
        }
    }

    public async Task<IReadOnlyList<string>> GetCuisinesAsync(CancellationToken cancellationToken)
    {
        await EnsureCatalogAsync(cancellationToken);
        return _cuisines ?? [];
    }

    public async Task<RecipePage> SearchAsync(RecipeQuery query, CancellationToken cancellationToken)
    {
        query = RecipeQuery.Create(
            query.Cuisine,
            query.Ingredient,
            query.Search,
            query.Page,
            query.PageSize,
            query.Sort,
            query.Direction);
        var catalog = await EnsureCatalogAsync(cancellationToken);

        string? cuisine = null;
        if (query.Cuisine is not null)
        {
            cuisine = _cuisines?.FirstOrDefault(name =>
                string.Equals(name, query.Cuisine, StringComparison.OrdinalIgnoreCase));
            if (cuisine is null)
            {
                return Empty(query);
            }
        }

        var needle = query.Ingredient is null ? null : Normalize(query.Ingredient);
        var selected = new List<Recipe>();
        foreach (var entry in catalog)
        {
            if (cuisine is not null && !string.Equals(entry.Cuisine, cuisine, StringComparison.OrdinalIgnoreCase))
            {
                continue;
            }

            if (query.Search is not null &&
                entry.Name.Contains(query.Search, StringComparison.OrdinalIgnoreCase) == false)
            {
                continue;
            }

            if (!_cache.TryGet(entry.Id, out var recipe) || recipe is null)
            {
                continue;
            }

            if (needle is not null &&
                !recipe.Ingredients.Any(ingredient => Normalize(ingredient.Name).Contains(needle, StringComparison.Ordinal)))
            {
                continue;
            }

            selected.Add(recipe);
        }

        selected.Sort((left, right) => CompareRecipes(left, right, query.Sort, query.Direction));

        return new RecipePage
        {
            Page = query.Page,
            PageSize = query.PageSize,
            Total = selected.Count,
            Items = selected
                .Skip((query.Page - 1) * query.PageSize)
                .Take(query.PageSize)
                .ToList()
        };
    }

    private async Task<IReadOnlyList<CatalogEntry>> EnsureCatalogAsync(CancellationToken cancellationToken)
    {
        if (_catalog is not null)
        {
            return _catalog;
        }

        await _catalogGate.WaitAsync(cancellationToken);
        try
        {
            if (_catalog is not null)
            {
                return _catalog;
            }

            var letters = Enumerable.Range('a', 26).Select(index => (char)index);
            var found = new ConcurrentBag<MealDbMeal>();
            await Parallel.ForEachAsync(letters, new ParallelOptions
            {
                MaxDegreeOfParallelism = RemoteParallelism,
                CancellationToken = cancellationToken
            }, async (letter, token) =>
            {
                foreach (var meal in await _mealDb.SearchByFirstLetterAsync(letter, token))
                {
                    found.Add(meal);
                }
            });

            var entries = new List<CatalogEntry>();
            foreach (var meal in found.GroupBy(meal => meal.Id, StringComparer.Ordinal).Select(group => group.First()))
            {
                var recipe = RecipeMapper.ToRecipe(meal);
                _cache.Set(recipe);
                entries.Add(new CatalogEntry(recipe.Id, recipe.Name, recipe.Cuisine));
            }

            entries.Sort((left, right) => string.Compare(left.Name, right.Name, StringComparison.OrdinalIgnoreCase));
            _cuisines = entries
                .Select(entry => entry.Cuisine)
                .Where(cuisine => !string.IsNullOrWhiteSpace(cuisine) && cuisine != "Unknown")
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .OrderBy(cuisine => cuisine, StringComparer.OrdinalIgnoreCase)
                .ToList();
            _catalog = entries;

            _logger.LogInformation(
                "Recipe catalog ready with {RecipeCount} meals and {CuisineCount} cuisines",
                entries.Count,
                _cuisines.Count);
            return _catalog;
        }
        finally
        {
            _catalogGate.Release();
        }
    }

    private static RecipePage Empty(RecipeQuery query)
    {
        return new RecipePage
        {
            Page = query.Page,
            PageSize = query.PageSize,
            Total = 0,
            Items = []
        };
    }

    private static int CompareRecipes(Recipe left, Recipe right, string sort, string direction)
    {
        var comparison = sort switch
        {
            RecipeQuery.SortPrepTime => left.PreparationTimeMinutes.CompareTo(right.PreparationTimeMinutes),
            RecipeQuery.SortDifficulty => DifficultyRank(left.Difficulty).CompareTo(DifficultyRank(right.Difficulty)),
            _ => string.Compare(left.Name, right.Name, StringComparison.OrdinalIgnoreCase)
        };

        if (comparison == 0)
        {
            comparison = string.Compare(left.Name, right.Name, StringComparison.OrdinalIgnoreCase);
        }

        return direction == "desc" ? -comparison : comparison;
    }

    private static int DifficultyRank(string difficulty)
    {
        return difficulty switch
        {
            "Easy" => 0,
            "Medium" => 1,
            "Hard" => 2,
            _ => 3
        };
    }

    private static string Normalize(string value)
    {
        return value.Trim().Replace('_', ' ').ToLowerInvariant();
    }

    private sealed record CatalogEntry(string Id, string Name, string Cuisine);
}
