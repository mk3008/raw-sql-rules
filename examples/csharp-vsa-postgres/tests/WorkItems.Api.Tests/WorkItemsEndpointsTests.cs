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
    public async Task GetWorkItems_FiltersByMinimumPriority()
    {
        await InsertWorkItemAsync(
            id: Guid.Parse("33333333-3333-3333-3333-333333333333"),
            title: "Medium priority follow-up",
            ownerId: Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
            status: 0,
            priority: 2,
            createdAt: DateTimeOffset.Parse("2026-09-01T12:00:00Z"),
            completedAt: null);

        var client = _factory.CreateClient();

        var response = await client.GetAsync("/work-items?minPriority=2&sort=created_desc");

        response.EnsureSuccessStatusCode();
        var payload = await response.Content.ReadFromJsonAsync<GetWorkItemsResponseContract>();

        Assert.NotNull(payload);
        Assert.Equal("created_desc", payload.Sort);
        Assert.Collection(
            payload.Items,
            item => Assert.Equal(Guid.Parse("33333333-3333-3333-3333-333333333333"), item.Id),
            item => Assert.Equal(Guid.Parse("11111111-1111-1111-1111-111111111111"), item.Id));
    }

    [Fact]
    public async Task GetWorkItems_UsesCreatedDescByDefault()
    {
        await InsertWorkItemAsync(
            id: Guid.Parse("33333333-3333-3333-3333-333333333333"),
            title: "Newest low priority",
            ownerId: Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
            status: 0,
            priority: 1,
            createdAt: DateTimeOffset.Parse("2026-09-01T12:00:00Z"),
            completedAt: null);

        var client = _factory.CreateClient();

        var response = await client.GetAsync("/work-items");

        response.EnsureSuccessStatusCode();
        var payload = await response.Content.ReadFromJsonAsync<GetWorkItemsResponseContract>();

        Assert.NotNull(payload);
        Assert.Equal("created_desc", payload.Sort);
        Assert.Collection(
            payload.Items,
            item => Assert.Equal(Guid.Parse("33333333-3333-3333-3333-333333333333"), item.Id),
            item => Assert.Equal(Guid.Parse("11111111-1111-1111-1111-111111111111"), item.Id),
            item => Assert.Equal(Guid.Parse("22222222-2222-2222-2222-222222222222"), item.Id));
    }

    [Fact]
    public async Task GetWorkItems_UsesTitleAscSortAsset()
    {
        await InsertWorkItemAsync(
            id: Guid.Parse("33333333-3333-3333-3333-333333333333"),
            title: "Alpha refinement",
            ownerId: Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
            status: 0,
            priority: 2,
            createdAt: DateTimeOffset.Parse("2026-09-01T12:00:00Z"),
            completedAt: null);

        var client = _factory.CreateClient();

        var response = await client.GetAsync("/work-items?sort=title_asc");

        response.EnsureSuccessStatusCode();
        var payload = await response.Content.ReadFromJsonAsync<GetWorkItemsResponseContract>();

        Assert.NotNull(payload);
        Assert.Equal("title_asc", payload.Sort);
        Assert.Collection(
            payload.Items,
            item => Assert.Equal(Guid.Parse("33333333-3333-3333-3333-333333333333"), item.Id),
            item => Assert.Equal(Guid.Parse("22222222-2222-2222-2222-222222222222"), item.Id),
            item => Assert.Equal(Guid.Parse("11111111-1111-1111-1111-111111111111"), item.Id));
    }

    [Fact]
    public async Task GetWorkItems_UsesPriorityDescSortAsset()
    {
        await InsertWorkItemAsync(
            id: Guid.Parse("33333333-3333-3333-3333-333333333333"),
            title: "Newest low priority",
            ownerId: Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
            status: 0,
            priority: 1,
            createdAt: DateTimeOffset.Parse("2026-09-01T12:00:00Z"),
            completedAt: null);

        await InsertWorkItemAsync(
            id: Guid.Parse("44444444-4444-4444-4444-444444444444"),
            title: "Older highest priority",
            ownerId: Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"),
            status: 0,
            priority: 5,
            createdAt: DateTimeOffset.Parse("2026-08-30T12:00:00Z"),
            completedAt: null);

        var client = _factory.CreateClient();

        var response = await client.GetAsync("/work-items?sort=priority_desc");

        response.EnsureSuccessStatusCode();
        var payload = await response.Content.ReadFromJsonAsync<GetWorkItemsResponseContract>();

        Assert.NotNull(payload);
        Assert.Equal("priority_desc", payload.Sort);
        Assert.Collection(
            payload.Items,
            item => Assert.Equal(Guid.Parse("44444444-4444-4444-4444-444444444444"), item.Id),
            item => Assert.Equal(Guid.Parse("11111111-1111-1111-1111-111111111111"), item.Id),
            item => Assert.Equal(Guid.Parse("33333333-3333-3333-3333-333333333333"), item.Id),
            item => Assert.Equal(Guid.Parse("22222222-2222-2222-2222-222222222222"), item.Id));
    }

    [Fact]
    public async Task GetCompletedWorkItems_ReturnsOnlySuccessfulCompletedItemsAndFiltersByOwnerAndCompletedRange()
    {
        await InsertWorkItemAsync(
            id: Guid.Parse("33333333-3333-3333-3333-333333333333"),
            title: "Latest completed follow-up",
            ownerId: Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
            status: 2,
            priority: 2,
            createdAt: DateTimeOffset.Parse("2026-09-01T09:00:00Z"),
            completedAt: DateTimeOffset.Parse("2026-09-01T10:00:00Z"));

        await InsertWorkItemAsync(
            id: Guid.Parse("44444444-4444-4444-4444-444444444444"),
            title: "Failed with timestamp",
            ownerId: Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
            status: 3,
            priority: 2,
            createdAt: DateTimeOffset.Parse("2026-09-01T09:30:00Z"),
            completedAt: DateTimeOffset.Parse("2026-09-01T11:00:00Z"));

        await InsertWorkItemAsync(
            id: Guid.Parse("55555555-5555-5555-5555-555555555555"),
            title: "Success without completion timestamp",
            ownerId: Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
            status: 2,
            priority: 1,
            createdAt: DateTimeOffset.Parse("2026-09-01T08:00:00Z"),
            completedAt: null);

        var client = _factory.CreateClient();

        var response = await client.GetAsync(
            "/work-items/completed?ownerId=aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa&completedFrom=2026-09-01T09:30:00Z&completedTo=2026-09-01T10:30:00Z");

        response.EnsureSuccessStatusCode();
        var payload = await response.Content.ReadFromJsonAsync<GetCompletedWorkItemsResponseContract>();

        Assert.NotNull(payload);
        var item = Assert.Single(payload.Items);
        Assert.Equal(Guid.Parse("33333333-3333-3333-3333-333333333333"), item.Id);
        Assert.Equal("success", item.Status);
        Assert.Equal(DateTimeOffset.Parse("2026-09-01T10:00:00Z"), item.CompletedAt);
    }

    [Fact]
    public async Task GetCompletedWorkItems_RejectsAnInvertedCompletedRange()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync(
            "/work-items/completed?completedFrom=2026-09-01T10:00:00Z&completedTo=2026-09-01T09:00:00Z");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
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
    public async Task PostComplete_IsIdempotentForAnAlreadyCompletedWorkItem()
    {
        var completedAtBefore = await GetCompletedAtAsync(Guid.Parse("22222222-2222-2222-2222-222222222222"));
        var client = _factory.CreateClient();

        var response = await client.PostAsync("/work-items/22222222-2222-2222-2222-222222222222/complete", content: null);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        var completedAtAfter = await GetCompletedAtAsync(Guid.Parse("22222222-2222-2222-2222-222222222222"));
        Assert.Equal(completedAtBefore, completedAtAfter);
        Assert.Equal(0L, await CountCompletedEventsAsync(Guid.Parse("22222222-2222-2222-2222-222222222222")));
    }

    [Fact]
    public async Task PostComplete_WritesOneEventAcrossRepeatedCalls()
    {
        var client = _factory.CreateClient();

        var firstResponse = await client.PostAsync("/work-items/11111111-1111-1111-1111-111111111111/complete", content: null);
        var completedAtAfterFirstCall = await GetCompletedAtAsync(Guid.Parse("11111111-1111-1111-1111-111111111111"));
        var secondResponse = await client.PostAsync("/work-items/11111111-1111-1111-1111-111111111111/complete", content: null);

        Assert.Equal(HttpStatusCode.NoContent, firstResponse.StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, secondResponse.StatusCode);
        Assert.Equal(completedAtAfterFirstCall, await GetCompletedAtAsync(Guid.Parse("11111111-1111-1111-1111-111111111111")));
        Assert.Equal(1L, await CountCompletedEventsAsync(Guid.Parse("11111111-1111-1111-1111-111111111111")));
    }

    [Fact]
    public async Task PostComplete_WritesOneEventAcrossConcurrentCalls()
    {
        var firstClient = _factory.CreateClient();
        var secondClient = _factory.CreateClient();

        var firstCall = firstClient.PostAsync("/work-items/11111111-1111-1111-1111-111111111111/complete", content: null);
        var secondCall = secondClient.PostAsync("/work-items/11111111-1111-1111-1111-111111111111/complete", content: null);

        var responses = await Task.WhenAll(firstCall, secondCall);

        Assert.All(responses, response => Assert.Equal(HttpStatusCode.NoContent, response.StatusCode));
        Assert.Equal(1L, await CountCompletedEventsAsync(Guid.Parse("11111111-1111-1111-1111-111111111111")));
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

    [Fact]
    public async Task PatchOwner_WritesOneOwnerChangedEventPerRealOwnerChange()
    {
        var workItemId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        var firstOwnerId = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");
        var secondOwnerId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
        var client = _factory.CreateClient();

        var firstResponse = await client.PatchAsJsonAsync($"/work-items/{workItemId}/owner", new { ownerId = firstOwnerId });
        var firstOwnerChangedAt = await GetLatestEventOccurredAtAsync(workItemId, "owner_changed");

        var secondResponse = await client.PatchAsJsonAsync($"/work-items/{workItemId}/owner", new { ownerId = secondOwnerId });
        var secondOwnerChangedAt = await GetLatestEventOccurredAtAsync(workItemId, "owner_changed");

        Assert.Equal(HttpStatusCode.NoContent, firstResponse.StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, secondResponse.StatusCode);
        Assert.Equal(secondOwnerId, await GetOwnerIdAsync(workItemId));
        Assert.Equal(2L, await CountEventsByTypeAsync(workItemId, "owner_changed"));
        Assert.NotNull(firstOwnerChangedAt);
        Assert.NotNull(secondOwnerChangedAt);
    }

    [Fact]
    public async Task PatchOwner_PersistsTheOperationTimestampOnOwnerChangedEvent()
    {
        var expectedOccurredAt = DateTimeOffset.Parse("2026-09-01T15:45:00Z");
        using var fixedTimeFactory = new WorkItemsApiFactory(new FixedTimeProvider(expectedOccurredAt));
        var client = fixedTimeFactory.CreateClient();

        var response = await client.PatchAsJsonAsync(
            "/work-items/11111111-1111-1111-1111-111111111111/owner",
            new { ownerId = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb") });

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        Assert.Equal(
            expectedOccurredAt,
            await GetLatestEventOccurredAtAsync(Guid.Parse("11111111-1111-1111-1111-111111111111"), "owner_changed"));
    }

    [Fact]
    public async Task PatchOwner_IsSuccessfulNoOpWhenOwnerDoesNotChange()
    {
        var workItemId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        var ownerIdBefore = await GetOwnerIdAsync(workItemId);
        var client = _factory.CreateClient();

        var response = await client.PatchAsJsonAsync($"/work-items/{workItemId}/owner", new { ownerId = ownerIdBefore });

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        Assert.Equal(ownerIdBefore, await GetOwnerIdAsync(workItemId));
        Assert.Equal(0L, await CountEventsByTypeAsync(workItemId, "owner_changed"));
    }

    [Fact]
    public async Task PatchOwner_ReturnsNotFoundWhenWorkItemDoesNotExist()
    {
        var client = _factory.CreateClient();

        var response = await client.PatchAsJsonAsync(
            "/work-items/33333333-3333-3333-3333-333333333333/owner",
            new { ownerId = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb") });

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        Assert.Equal(0L, await CountEventsByTypeAsync(Guid.Parse("33333333-3333-3333-3333-333333333333"), "owner_changed"));
    }

    private static async Task InsertWorkItemAsync(
        Guid id,
        string title,
        Guid ownerId,
        short status,
        short priority,
        DateTimeOffset createdAt,
        DateTimeOffset? completedAt)
    {
        await using var dataSource = NpgsqlDataSource.Create(ConnectionString);
        await using var connection = await dataSource.OpenConnectionAsync();
        await using var command = connection.CreateCommand();
        command.CommandText = """
            INSERT INTO work_items (id, title, owner_id, status, priority, created_at, completed_at)
            VALUES (@id, @title, @owner_id, @status, @priority, @created_at, @completed_at)
            """;
        command.Parameters.AddWithValue("id", id);
        command.Parameters.AddWithValue("title", title);
        command.Parameters.AddWithValue("owner_id", ownerId);
        command.Parameters.AddWithValue("status", status);
        command.Parameters.AddWithValue("priority", priority);
        command.Parameters.AddWithValue("created_at", createdAt);
        command.Parameters.AddWithValue("completed_at", completedAt ?? (object)DBNull.Value);
        await command.ExecuteNonQueryAsync();
    }

    private static async Task<DateTimeOffset?> GetCompletedAtAsync(Guid workItemId)
    {
        await using var dataSource = NpgsqlDataSource.Create(ConnectionString);
        await using var connection = await dataSource.OpenConnectionAsync();
        await using var command = connection.CreateCommand();
        command.CommandText = """
            SELECT completed_at
            FROM work_items
            WHERE id = @id
            """;
        command.Parameters.AddWithValue("id", workItemId);

        var value = await command.ExecuteScalarAsync();
        return value switch
        {
            null or DBNull => null,
            DateTimeOffset timestamp => timestamp,
            DateTime timestamp => new DateTimeOffset(timestamp, TimeSpan.Zero),
            _ => throw new InvalidOperationException($"Unexpected completed_at value type: {value.GetType().FullName}")
        };
    }

    private static async Task<Guid> GetOwnerIdAsync(Guid workItemId)
    {
        await using var dataSource = NpgsqlDataSource.Create(ConnectionString);
        await using var connection = await dataSource.OpenConnectionAsync();
        await using var command = connection.CreateCommand();
        command.CommandText = """
            SELECT owner_id
            FROM work_items
            WHERE id = @id
            """;
        command.Parameters.AddWithValue("id", workItemId);
        return (Guid)(await command.ExecuteScalarAsync() ?? throw new InvalidOperationException("Expected work item owner."));
    }

    private static async Task<long> CountCompletedEventsAsync(Guid workItemId)
    {
        return await CountEventsByTypeAsync(workItemId, "completed");
    }

    private static async Task<long> CountEventsByTypeAsync(Guid workItemId, string eventType)
    {
        await using var dataSource = NpgsqlDataSource.Create(ConnectionString);
        await using var connection = await dataSource.OpenConnectionAsync();
        await using var command = connection.CreateCommand();
        command.CommandText = """
            SELECT COUNT(*)
            FROM work_item_events
            WHERE work_item_id = @id
              AND event_type = @event_type
            """;
        command.Parameters.AddWithValue("id", workItemId);
        command.Parameters.AddWithValue("event_type", eventType);
        return (long)(await command.ExecuteScalarAsync() ?? 0L);
    }

    private static async Task<DateTimeOffset?> GetLatestEventOccurredAtAsync(Guid workItemId, string eventType)
    {
        await using var dataSource = NpgsqlDataSource.Create(ConnectionString);
        await using var connection = await dataSource.OpenConnectionAsync();
        await using var command = connection.CreateCommand();
        command.CommandText = """
            SELECT occurred_at
            FROM work_item_events
            WHERE work_item_id = @id
              AND event_type = @event_type
            ORDER BY occurred_at DESC
            LIMIT 1
            """;
        command.Parameters.AddWithValue("id", workItemId);
        command.Parameters.AddWithValue("event_type", eventType);

        var value = await command.ExecuteScalarAsync();
        return value switch
        {
            null or DBNull => null,
            DateTimeOffset timestamp => timestamp,
            DateTime timestamp => new DateTimeOffset(timestamp, TimeSpan.Zero),
            _ => throw new InvalidOperationException($"Unexpected occurred_at value type: {value.GetType().FullName}")
        };
    }

    public sealed record GetWorkItemsResponseContract(
        IReadOnlyList<WorkItemListItemContract> Items,
        string Sort,
        int PageSize);

    public sealed record GetCompletedWorkItemsResponseContract(
        IReadOnlyList<WorkItemListItemContract> Items);

    public sealed record WorkItemListItemContract(
        Guid Id,
        string Title,
        Guid OwnerId,
        string Status,
        short Priority,
        DateTimeOffset CreatedAt,
        DateTimeOffset? CompletedAt);

    private sealed class FixedTimeProvider(DateTimeOffset utcNow) : TimeProvider
    {
        public override DateTimeOffset GetUtcNow() => utcNow;
    }
}
