using Microsoft.OpenApi.Models;
using RecipeDiscovery.Api;
using RecipeDiscovery.Api.Auth;
using RecipeDiscovery.Api.GraphQL;
using RecipeDiscovery.Api.MealDb;
using RecipeDiscovery.Api.Services;

var builder = WebApplication.CreateBuilder(args);

var port = Environment.GetEnvironmentVariable("PORT");
if (!string.IsNullOrWhiteSpace(port))
{
    builder.WebHost.UseUrls($"http://0.0.0.0:{port}");
}

builder.Services.AddProblemDetails();
builder.Services.AddHttpContextAccessor();
builder.Services.AddAuthentication(DemoAuthHandler.SchemeName)
    .AddScheme<Microsoft.AspNetCore.Authentication.AuthenticationSchemeOptions, DemoAuthHandler>(
        DemoAuthHandler.SchemeName,
        _ => { });
builder.Services.AddAuthorization();
builder.Services.AddHttpResponseFormatter<GraphQlHttpResponseFormatter>();
builder.Services.AddExceptionHandler<ApiExceptionHandler>();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Recipe Discovery API",
        Version = "v1",
        Description = "REST recipes and favorites. GraphQL is served at /graphql."
    });
});

builder.Services.AddHttpClient<IMealDbClient, MealDbClient>(client =>
{
    client.BaseAddress = new Uri("https://www.themealdb.com/api/json/v1/1/");
    client.Timeout = TimeSpan.FromSeconds(20);
    client.DefaultRequestHeaders.UserAgent.ParseAdd("RecipeDiscovery/1.0");
});

builder.Services.Configure<AuthOptions>(builder.Configuration.GetSection(AuthOptions.Section));
builder.Services.AddSingleton<RecipeCache>();
builder.Services.AddSingleton<AccountStore>();
builder.Services.AddSingleton<FavoriteStore>();
builder.Services.AddSingleton<DemoTokenService>();
builder.Services.AddSingleton<IRecipeService, RecipeService>();
builder.Services.AddSingleton<IFavoriteService, FavoriteService>();
builder.Services.AddSingleton<INutritionSource, NutritionSource>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("frontend", policy =>
    {
        policy.WithOrigins(
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "http://localhost:4173",
                "http://127.0.0.1:4173")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services
    .AddGraphQLServer()
    .AddQueryType<Query>()
    .AddMutationType<Mutation>()
    .AddType<RecipeType>()
    .AddErrorFilter<ApiErrorFilter>();

var app = builder.Build();

app.UseExceptionHandler();
app.UseSwagger();
app.UseSwaggerUI();
app.UseCors("frontend");
app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/", () => Results.Ok(new
{
    name = "Recipe Discovery API",
    rest = "/swagger",
    graphql = "/graphql"
}));

app.MapControllers();
app.MapGraphQL();

app.Run();

public partial class Program
{
}
