using HotChocolate.Types;
using RecipeDiscovery.Api.Contracts;

namespace RecipeDiscovery.Api.GraphQL;

public sealed class RecipeType : ObjectType<Recipe>
{
    protected override void Configure(IObjectTypeDescriptor<Recipe> descriptor)
    {
        descriptor.Name("Recipe");
        descriptor.Field(recipe => recipe.Id).ID();
    }
}
