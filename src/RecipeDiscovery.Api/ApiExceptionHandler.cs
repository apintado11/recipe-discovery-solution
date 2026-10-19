using Microsoft.AspNetCore.Diagnostics;
using RecipeDiscovery.Api.MealDb;

namespace RecipeDiscovery.Api;

public sealed class ApiExceptionHandler : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        var (status, title) = exception switch
        {
            NotFoundException => (StatusCodes.Status404NotFound, "Not found"),
            MealDbUnavailableException => (StatusCodes.Status503ServiceUnavailable, "Recipe source unavailable"),
            _ => (0, "")
        };

        if (status == 0)
        {
            return false;
        }

        await Results.Problem(
            statusCode: status,
            title: title,
            detail: exception.Message).ExecuteAsync(httpContext);

        return true;
    }
}
