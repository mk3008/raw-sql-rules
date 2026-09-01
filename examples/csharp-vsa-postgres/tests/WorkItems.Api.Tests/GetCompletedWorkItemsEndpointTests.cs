using System.Net;
using System.Net.Http.Json;
using Xunit;

namespace WorkItems.Api.Tests;

public sealed class GetCompletedWorkItemsEndpointTests
{
    [Fact]
    public async Task GetCompletedWorkItems_ReturnsOnlySuccessfullyCompletedItems()
    {
        await using var database = await PostgresTestDatabase.CreateAsync();
        await using var factory = new WorkItemsApiFactory(database.ConnectionString);
        using var client = factory.CreateClient();

        var response = await client.GetAsync("/work-items/completed");

        response.EnsureSuccessStatusCode();

        var payload = await response.Content.ReadFromJsonAsync<IReadOnlyList<WorkItemContract>>();

        Assert.NotNull(payload);
        var item = Assert.Single(payload);
        Assert.Equal(Guid.Parse("22222222-2222-2222-2222-222222222222"), item.Id);
        Assert.Equal("success", item.Status);
        Assert.NotNull(item.CompletedAt);
    }

    [Fact]
    public async Task GetCompletedWorkItems_FiltersByOwnerAndCompletionWindow()
    {
        await using var database = await PostgresTestDatabase.CreateAsync();
        await using var factory = new WorkItemsApiFactory(database.ConnectionString);
        using var client = factory.CreateClient();

        var response = await client.GetAsync(
            "/work-items/completed?ownerId=bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb&completedFrom=2026-08-31T10:00:00%2B09:00&completedTo=2026-08-31T10:00:00%2B09:00");

        response.EnsureSuccessStatusCode();

        var payload = await response.Content.ReadFromJsonAsync<IReadOnlyList<WorkItemContract>>();

        Assert.NotNull(payload);
        var item = Assert.Single(payload);
        Assert.Equal("Completed baseline", item.Title);
    }

    [Fact]
    public async Task GetCompletedWorkItems_RejectsInvalidCompletionWindow()
    {
        await using var database = await PostgresTestDatabase.CreateAsync();
        await using var factory = new WorkItemsApiFactory(database.ConnectionString);
        using var client = factory.CreateClient();

        var response = await client.GetAsync(
            "/work-items/completed?completedFrom=2026-09-01T00:00:01Z&completedTo=2026-09-01T00:00:00Z");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
}
