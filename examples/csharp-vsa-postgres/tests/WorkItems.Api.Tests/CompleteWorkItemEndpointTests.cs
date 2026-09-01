using System.Net;
using System.Net.Http.Json;
using Npgsql;
using Xunit;

namespace WorkItems.Api.Tests;

public sealed class CompleteWorkItemEndpointTests
{
    [Fact]
    public async Task CompleteWorkItem_UpdatesStatusAndWritesEventAtomically()
    {
        await using var database = await PostgresTestDatabase.CreateAsync();
        await using var factory = new WorkItemsApiFactory(database.ConnectionString);
        using var client = factory.CreateClient();

        var response = await client.PostAsync("/work-items/11111111-1111-1111-1111-111111111111/complete", null);

        response.EnsureSuccessStatusCode();

        var payload = await response.Content.ReadFromJsonAsync<WorkItemContract>();
        Assert.NotNull(payload);
        Assert.Equal("success", payload.Status);
        Assert.NotNull(payload.CompletedAt);

        await using var connection = new NpgsqlConnection(database.ConnectionString);
        await connection.OpenAsync();

        await using var command = new NpgsqlCommand(
            """
            SELECT
                status,
                completed_at,
                (
                    SELECT COUNT(*)
                    FROM work_item_events
                    WHERE work_item_id = @work_item_id
                      AND event_type = 'completed'
                ) AS completed_event_count
            FROM work_items
            WHERE id = @work_item_id;
            """,
            connection);
        command.Parameters.AddWithValue("work_item_id", Guid.Parse("11111111-1111-1111-1111-111111111111"));

        await using var reader = await command.ExecuteReaderAsync();
        Assert.True(await reader.ReadAsync());
        Assert.Equal((short)2, reader.GetInt16(0));
        Assert.False(reader.IsDBNull(1));
        Assert.Equal(1L, reader.GetInt64(2));
    }

    [Fact]
    public async Task CompleteWorkItem_ReturnsNotFoundWhenItemDoesNotExist()
    {
        await using var database = await PostgresTestDatabase.CreateAsync();
        await using var factory = new WorkItemsApiFactory(database.ConnectionString);
        using var client = factory.CreateClient();

        var response = await client.PostAsync("/work-items/33333333-3333-3333-3333-333333333333/complete", null);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);

        await using var connection = new NpgsqlConnection(database.ConnectionString);
        await connection.OpenAsync();

        await using var command = new NpgsqlCommand("SELECT COUNT(*) FROM work_item_events;", connection);
        var count = (long)(await command.ExecuteScalarAsync() ?? 0L);
        Assert.Equal(0L, count);
    }
}
