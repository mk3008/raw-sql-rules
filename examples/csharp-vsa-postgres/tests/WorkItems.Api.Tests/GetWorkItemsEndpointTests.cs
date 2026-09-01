using System.Net;
using System.Net.Http.Json;
using Xunit;

namespace WorkItems.Api.Tests;

public sealed class GetWorkItemsEndpointTests
{
    [Fact]
    public async Task GetWorkItems_FiltersAndSortsUsingReviewedModes()
    {
        await using var database = await PostgresTestDatabase.CreateAsync();
        await using var factory = new WorkItemsApiFactory(database.ConnectionString);
        using var client = factory.CreateClient();

        var response = await client.GetAsync(
            "/work-items?ownerId=aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa&status=pending&sort=priority_desc&page=1&pageSize=5");

        response.EnsureSuccessStatusCode();

        var payload = await response.Content.ReadFromJsonAsync<GetWorkItemsResponseContract>();

        Assert.NotNull(payload);
        var item = Assert.Single(payload.Items);
        Assert.Equal(Guid.Parse("11111111-1111-1111-1111-111111111111"), item.Id);
        Assert.Equal("pending", item.Status);
        Assert.Equal("priority_desc", payload.Sort);
        Assert.Equal(5, payload.PageSize);
    }

    [Fact]
    public async Task GetWorkItems_RejectsUnknownSortMode()
    {
        await using var database = await PostgresTestDatabase.CreateAsync();
        await using var factory = new WorkItemsApiFactory(database.ConnectionString);
        using var client = factory.CreateClient();

        var response = await client.GetAsync("/work-items?sort=unexpected");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task GetWorkItems_BoundsPageSize()
    {
        await using var database = await PostgresTestDatabase.CreateAsync();
        await using var factory = new WorkItemsApiFactory(database.ConnectionString);
        using var client = factory.CreateClient();

        var response = await client.GetAsync("/work-items?page=1&pageSize=500");

        response.EnsureSuccessStatusCode();

        var payload = await response.Content.ReadFromJsonAsync<GetWorkItemsResponseContract>();

        Assert.NotNull(payload);
        Assert.Equal(100, payload.PageSize);
        Assert.Equal(2, payload.Items.Count);
    }

    [Fact]
    public async Task GetWorkItems_FiltersByMinimumPriority()
    {
        await using var database = await PostgresTestDatabase.CreateAsync();
        await using var factory = new WorkItemsApiFactory(database.ConnectionString);
        using var client = factory.CreateClient();

        var response = await client.GetAsync("/work-items?minimumPriority=2");

        response.EnsureSuccessStatusCode();

        var payload = await response.Content.ReadFromJsonAsync<GetWorkItemsResponseContract>();

        Assert.NotNull(payload);
        var item = Assert.Single(payload.Items);
        Assert.Equal("Prepare dogfood", item.Title);
        Assert.Equal((short)3, item.Priority);
    }

    [Fact]
    public async Task GetWorkItems_SortsByTitleAscending()
    {
        await using var database = await PostgresTestDatabase.CreateAsync();
        await using var factory = new WorkItemsApiFactory(database.ConnectionString);
        using var client = factory.CreateClient();

        var response = await client.GetAsync("/work-items?sort=title_asc");

        response.EnsureSuccessStatusCode();

        var payload = await response.Content.ReadFromJsonAsync<GetWorkItemsResponseContract>();

        Assert.NotNull(payload);
        Assert.Equal("title_asc", payload.Sort);
        Assert.Equal("Completed baseline", payload.Items[0].Title);
        Assert.Equal("Prepare dogfood", payload.Items[1].Title);
    }
}

public sealed record GetWorkItemsResponseContract(
    IReadOnlyList<WorkItemContract> Items,
    int Page,
    int PageSize,
    string Sort);
