using HotChocolate;
using RecipeDiscovery.Api.MealDb;

namespace RecipeDiscovery.Api.GraphQL;

public sealed class ApiErrorFilter : IErrorFilter
{
    public IError OnError(IError error)
    {
        if (error.Exception is ForbiddenException forbidden)
        {
            return error.WithMessage(forbidden.Message).WithCode("FORBIDDEN");
        }

        if (error.Exception is NotFoundException notFound)
        {
            return error.WithMessage(notFound.Message).WithCode("NOT_FOUND");
        }

        if (error.Exception is MealDbUnavailableException unavailable)
        {
            return error.WithMessage(unavailable.Message).WithCode("RECIPE_SOURCE_UNAVAILABLE");
        }

        return error;
    }
}
