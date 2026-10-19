namespace RecipeDiscovery.Api.MealDb;

public sealed class MealDbUnavailableException : Exception
{
    public MealDbUnavailableException(string message, Exception innerException)
        : base(message, innerException)
    {
    }
}
