using Npgsql;
using Xunit;

namespace WorkItems.Api.Tests;

public sealed class DatabaseFixture : IAsyncLifetime
{
    private const string ConnectionString =
        "Host=localhost;Port=54329;Database=work_items;Username=work_items;Password=work_items";

    private readonly string _seedSql = File.ReadAllText(
        Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..", "..", "database", "seed", "001_work_items.sql")));

    public async Task InitializeAsync()
    {
        await using var dataSource = NpgsqlDataSource.Create(ConnectionString);
        await using var connection = await dataSource.OpenConnectionAsync();
        await using var command = connection.CreateCommand();
        command.CommandText = "SELECT 1";
        await command.ExecuteScalarAsync();
    }

    public Task DisposeAsync() => Task.CompletedTask;

    public async Task ResetAsync()
    {
        await using var dataSource = NpgsqlDataSource.Create(ConnectionString);
        await using var connection = await dataSource.OpenConnectionAsync();
        await using var command = connection.CreateCommand();
        command.CommandText = """
            TRUNCATE TABLE work_item_events, work_items RESTART IDENTITY;
            """;
        await command.ExecuteNonQueryAsync();

        await using var seedCommand = connection.CreateCommand();
        seedCommand.CommandText = _seedSql;
        await seedCommand.ExecuteNonQueryAsync();
    }
}

[CollectionDefinition(Name)]
public sealed class DatabaseCollection : ICollectionFixture<DatabaseFixture>
{
    public const string Name = "database";
}
