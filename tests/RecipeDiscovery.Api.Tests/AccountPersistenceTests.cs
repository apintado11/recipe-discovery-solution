using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;

namespace RecipeDiscovery.Api.Tests;

public sealed class AccountPersistenceTests : IDisposable
{
    private readonly string _directory = Path.Combine(Path.GetTempPath(), "recipe-auth-" + Guid.NewGuid().ToString("N"));

    public AccountPersistenceTests()
    {
        Directory.CreateDirectory(_directory);
    }

    [Fact]
    public async Task Accounts_SurviveARestart_AndPasswordsStayHashed()
    {
        var email = $"keep-{Guid.NewGuid():N}@recipe.test";
        var path = Path.Combine(_directory, "accounts.json");

        await using (var first = new PersistFactory(_directory))
        {
            var client = first.CreateClient();
            var created = await client.PostAsJsonAsync("/auth/register", new { name = "Riley", email, password = "kitchen1" });
            Assert.Equal(HttpStatusCode.OK, created.StatusCode);
        }

        var json = File.ReadAllText(path);
        Assert.Contains("pbkdf2", json, StringComparison.Ordinal);
        Assert.DoesNotContain("kitchen1", json, StringComparison.Ordinal);

        await using var second = new PersistFactory(_directory);
        var again = second.CreateClient();
        var login = await again.PostAsJsonAsync("/auth/login", new { email, password = "kitchen1" });
        Assert.Equal(HttpStatusCode.OK, login.StatusCode);
    }

    public void Dispose()
    {
        try
        {
            Directory.Delete(_directory, recursive: true);
        }
        catch (IOException)
        {
            // The next test run uses a new directory.
        }
    }

    private sealed class PersistFactory : WebApplicationFactory<Program>
    {
        private readonly string _directory;

        public PersistFactory(string directory)
        {
            _directory = directory;
        }

        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.UseEnvironment("Development");
            builder.ConfigureAppConfiguration((_, config) =>
            {
                config.AddInMemoryCollection(new Dictionary<string, string?>
                {
                    ["Auth:Persist"] = "true",
                    ["Auth:StorePath"] = Path.Combine(_directory, "accounts.json")
                });
            });
        }
    }
}
