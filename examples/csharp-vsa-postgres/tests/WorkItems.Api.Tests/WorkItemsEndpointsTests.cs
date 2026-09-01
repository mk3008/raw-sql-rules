using System.Net;
using System.Net.Http.Json;
using Npgsql;
using Xunit;

namespace WorkItems.Api.Tests;

[Collection(DatabaseCollection.Name)]
public sealed class WorkItemsEndpointsTests(DatabaseFixture databaseFixture) : IAsyncLifetime
{
    private const string ConnectionString =
        "Host=localhost;Port=54329;Database=work_items;Username=work_items;Password=work_items";

    private readonly WorkItemsApiFactory _factory = new();

    public Task InitializeAsync() => databaseFixture.ResetAsync();

    public Task DisposeAsync()
    {
        _factory.Dispose();
        return Task.CompletedTask;
    }

    [Fact]
    public async Task GetWorkItems_FiltersAndSortsByCreatedAscending()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync(
            "/work-items?createdFrom=2026-08-30T00:00:00Z&createdTo=2026-09-02T00:00:00Z&sort=created_asc&pageSize=10");

        response.EnsureSuccessStatusCode();
        var payload = await response.Content.ReadFromJsonAsync<GetWorkItemsResponseContract>();

        Assert.NotNull(payload);
        Assert.Equal("created_asc", payload.Sort);
        Assert.Equal(10, payload.PageSize);
        Assert.Collection(
            payload.Items,
            item => Assert.Equal(Guid.Parse("22222222-2222-2222-2222-222222222222"), item.Id),
            item => Assert.Equal(Guid.Parse("11111111-1111-1111-1111-111111111111"), item.Id));
    }

    [Fact]
    public async Task GetWorkItems_ClampsPageSizeToConfiguredMaximum()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/work-items?pageSize=101");

        response.EnsureSuccessStatusCode();
        var payload = await response.Content.ReadFromJsonAsync<GetWorkItemsResponseContract>();

        Assert.NotNull(payload);
        Assert.Equal(100, payload.PageSize);
    }

    [Fact]
    public async Task GetWorkItems_RejectsUnknownSortModes()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/work-items?sort=surprise");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task GetWorkItems_FiltersByOwnerAndStatus()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync(
            "/work-items?ownerId=aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa&status=pending");

        response.EnsureSuccessStatusCode();
        var payload = await response.Content.ReadFromJsonAsync<GetWorkItemsResponseContract>();

        Assert.NotNull(payload);
        var item = Assert.Single(payload.Items);
        Assert.Equal(Guid.Parse("11111111-1111-1111-1111-111111111111"), item.Id);
        Assert.Equal("pending", item.Status);
    }

    [Fact]
    public async Task PostComplete_MarksSuccessAndWritesEventAtomically()
    {
        var client = _factory.CreateClient();

        var response = await client.PostAsync("/work-items/11111111-1111-1111-1111-111111111111/complete", content: null);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

        await using var dataSource = NpgsqlDataSource.Create(ConnectionString);
        await using var connection = await dataSource.OpenConnectionAsync();

        await using var workItemCommand = connection.CreateCommand();
        workItemCommand.CommandText = """
            SELECT status, completed_at
            FROM work_items
            WHERE id = '11111111-1111-1111-1111-111111111111'
            """;
        await using var reader = await workItemCommand.ExecuteReaderAsync();
        Assert.True(await reader.ReadAsync());
        Assert.Equal((short)2, reader.GetInt16(0));
        Assert.False(reader.IsDBNull(1));
        await reader.DisposeAsync();

        await using var eventCommand = connection.CreateCommand();
        eventCommand.CommandText = """
            SELECT COUNT(*)
            FROM work_item_events
            WHERE work_item_id = '11111111-1111-1111-1111-111111111111'
              AND event_type = 'completed'
            """;
        var eventCount = (long)(await eventCommand.ExecuteScalarAsync() ?? 0L);
        Assert.Equal(1L, eventCount);
    }

    [Fact]
    public async Task PostComplete_ReturnsNotFoundWhenWorkItemDoesNotExist()
    {
        var client = _factory.CreateClient();

        var response = await client.PostAsync("/work-items/33333333-3333-3333-3333-333333333333/complete", content: null);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);

        await using var dataSource = NpgsqlDataSource.Create(ConnectionString);
        await using var connection = await dataSource.OpenConnectionAsync();
        await using var command = connection.CreateCommand();
        command.CommandText = "SELECT COUNT(*) FROM work_item_events";
        var eventCount = (long)(await command.ExecuteScalarAsync() ?? 0L);
        Assert.Equal(0L, eventCount);
    }

    public sealed record GetWorkItemsResponseContract(
        IReadOnlyList<WorkItemListItemContract> Items,
        string Sort,
        int PageSize);

    public sealed record WorkItemListItemContract(
        Guid Id,
        string Title,
        Guid OwnerId,
        string Status,
        short Priority,
        DateTimeOffset CreatedAt,
        DateTimeOffset? CompletedAt);
}
