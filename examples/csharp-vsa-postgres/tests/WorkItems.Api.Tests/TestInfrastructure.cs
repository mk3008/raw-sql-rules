using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Npgsql;

namespace WorkItems.Api.Tests;

internal sealed class WorkItemsApiFactory(string connectionString) : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.ConfigureAppConfiguration((_, configurationBuilder) =>
        {
            configurationBuilder.AddInMemoryCollection(
            [
                new KeyValuePair<string, string?>("ConnectionStrings:WorkItems", connectionString)
            ]);
        });
    }
}

internal sealed class PostgresTestDatabase : IAsyncDisposable
{
    private const string ServerConnectionString = "Host=localhost;Port=54329;Database=postgres;Username=work_items;Password=work_items";

    private readonly string _databaseName;

    private PostgresTestDatabase(string databaseName)
    {
        _databaseName = databaseName;
        ConnectionString = $"Host=localhost;Port=54329;Database={databaseName};Username=work_items;Password=work_items";
    }

    public string ConnectionString { get; }

    public static async Task<PostgresTestDatabase> CreateAsync()
    {
        var database = new PostgresTestDatabase($"work_items_test_{Guid.NewGuid():N}");
        await database.InitializeAsync();
        return database;
    }

    public async ValueTask DisposeAsync()
    {
        await using var connection = new NpgsqlConnection(ServerConnectionString);
        await connection.OpenAsync();

        await using (var terminateCommand = new NpgsqlCommand(
            """
            SELECT pg_terminate_backend(pid)
            FROM pg_stat_activity
            WHERE datname = @database_name
              AND pid <> pg_backend_pid();
            """,
            connection))
        {
            terminateCommand.Parameters.AddWithValue("database_name", _databaseName);
            await terminateCommand.ExecuteNonQueryAsync();
        }

        await using var dropCommand = new NpgsqlCommand($"DROP DATABASE IF EXISTS \"{_databaseName}\";", connection);
        await dropCommand.ExecuteNonQueryAsync();
    }

    private async Task InitializeAsync()
    {
        await using var connection = new NpgsqlConnection(ServerConnectionString);
        await connection.OpenAsync();

        await using (var createCommand = new NpgsqlCommand($"CREATE DATABASE \"{_databaseName}\";", connection))
        {
            await createCommand.ExecuteNonQueryAsync();
        }

        await using var databaseConnection = new NpgsqlConnection(ConnectionString);
        await databaseConnection.OpenAsync();

        var schemaScript = await File.ReadAllTextAsync(Path.Combine(AppContext.BaseDirectory, "database", "schema", "001_work_items.sql"));
        var seedScript = await File.ReadAllTextAsync(Path.Combine(AppContext.BaseDirectory, "database", "seed", "001_work_items.sql"));

        await using (var schemaCommand = new NpgsqlCommand(schemaScript, databaseConnection))
        {
            await schemaCommand.ExecuteNonQueryAsync();
        }

        await using var seedCommand = new NpgsqlCommand(seedScript, databaseConnection);
        await seedCommand.ExecuteNonQueryAsync();
    }
}

public sealed record WorkItemContract(
    Guid Id,
    string Title,
    Guid OwnerId,
    string Status,
    short Priority,
    DateTimeOffset CreatedAt,
    DateTimeOffset? CompletedAt);
