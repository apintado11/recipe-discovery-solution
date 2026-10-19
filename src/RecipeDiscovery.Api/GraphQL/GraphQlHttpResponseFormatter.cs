using System.Net;
using HotChocolate.AspNetCore.Serialization;
using HotChocolate.Execution;

namespace RecipeDiscovery.Api.GraphQL;

public sealed class GraphQlHttpResponseFormatter : DefaultHttpResponseFormatter
{
    protected override HttpStatusCode OnDetermineStatusCode(
        IQueryResult result,
        FormatInfo format,
        HttpStatusCode? proposedStatusCode)
    {
        if (result.Errors is { Count: > 0 } &&
            result.Errors.All(error => error.Code is "NOT_FOUND" or "RECIPE_SOURCE_UNAVAILABLE"))
        {
            return HttpStatusCode.OK;
        }

        return base.OnDetermineStatusCode(result, format, proposedStatusCode);
    }
}
