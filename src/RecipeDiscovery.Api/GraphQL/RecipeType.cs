using HotChocolate.Types;
using RecipeDiscovery.Api.Contracts;
using RecipeDiscovery.Api.Services;

namespace RecipeDiscovery.Api.GraphQL;

public sealed class RecipeType : ObjectType<Recipe>
{
    protected override void Configure(IObjectTypeDescriptor<Recipe> descriptor)
    {
        descriptor.Name("Recipe");
        descriptor.Field(recipe => recipe.Id).ID();
        descriptor
            .Field("nutrition")
            .Resolve(context =>
            {
                var recipe = context.Parent<Recipe>();
                return context.Service<INutritionSource>().Estimate(recipe);
            });
    }
}
