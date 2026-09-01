using Microsoft.AspNetCore.Mvc;
using Npgsql;
using NpgsqlTypes;
using WorkItems.Api.Infrastructure;

namespace WorkItems.Api.Features.WorkItems.GetWorkItems;

internal static class GetWorkItemsEndpoint
{
    private const int DefaultPage = 1;
    private const int DefaultPageSize = 50;
    private const int MaxPageSize = 100;

    private static readonly IReadOnlyDictionary<string, string> SqlBySortMode = new Dictionary<string, string>(StringComparer.Ordinal)
    {
        ["created_desc"] = SqlAsset.Load("Features", "WorkItems", "GetWorkItems", "list_created_desc.sql"),
        ["created_asc"] = SqlAsset.Load("Features", "WorkItems", "GetWorkItems", "list_created_asc.sql"),
        ["priority_desc"] = SqlAsset.Load("Features", "WorkItems", "GetWorkItems", "list_priority_desc.sql"),
        ["title_asc"] = SqlAsset.Load("Features", "WorkItems", "GetWorkItems", "list_title_asc.sql")
    };

    public static IEndpointRouteBuilder MapGetWorkItems(this IEndpointRouteBuilder app)
    {
        app.MapGet("/work-items", HandleAsync);
        return app;
    }

    private static async Task<IResult> HandleAsync(
        [AsParameters] GetWorkItemsRequest request,
        NpgsqlDataSource dataSource,
        CancellationToken cancellationToken)
    {
        var errors = Validate(request);
        if (errors.Count > 0)
        {
            return Results.ValidationProblem(errors);
        }

        var sort = string.IsNullOrWhiteSpace(request.Sort) ? "created_desc" : request.Sort;
        var page = request.Page ?? DefaultPage;
        var pageSize = Math.Min(request.PageSize ?? DefaultPageSize, MaxPageSize);
        var offset = ((long)page - 1L) * pageSize;
        WorkItemStatusCodec.TryParse(request.Status, out var status);

        await using var command = dataSource.CreateCommand(SqlBySortMode[sort]);
        command.Parameters.Add(new NpgsqlParameter("owner_id", NpgsqlDbType.Uuid)
        {
            Value = request.OwnerId.HasValue ? request.OwnerId.Value : DBNull.Value
        });
        command.Parameters.Add(new NpgsqlParameter("status", NpgsqlDbType.Smallint)
        {
            Value = status.HasValue ? (short)status.Value : DBNull.Value
        });
        command.Parameters.Add(new NpgsqlParameter("created_from", NpgsqlDbType.TimestampTz)
        {
            Value = request.CreatedFrom.HasValue ? NormalizeTimestamp(request.CreatedFrom.Value) : DBNull.Value
        });
        command.Parameters.Add(new NpgsqlParameter("created_to", NpgsqlDbType.TimestampTz)
        {
            Value = request.CreatedTo.HasValue ? NormalizeTimestamp(request.CreatedTo.Value) : DBNull.Value
        });
        command.Parameters.Add(new NpgsqlParameter("minimum_priority", NpgsqlDbType.Smallint)
        {
            Value = request.MinimumPriority.HasValue ? request.MinimumPriority.Value : DBNull.Value
        });
        command.Parameters.AddWithValue("page_size", pageSize);
        command.Parameters.Add(new NpgsqlParameter("offset", NpgsqlDbType.Bigint)
        {
            Value = offset
        });

        var items = new List<WorkItemResponse>();
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        while (await reader.ReadAsync(cancellationToken))
        {
            items.Add(WorkItemReader.Read(reader).ToResponse());
        }

        return Results.Ok(new GetWorkItemsResponse(items, page, pageSize, sort));
    }

    private static Dictionary<string, string[]> Validate(GetWorkItemsRequest request)
    {
        var errors = new Dictionary<string, string[]>(StringComparer.Ordinal);

        if (!string.IsNullOrWhiteSpace(request.Sort) && !SqlBySortMode.ContainsKey(request.Sort))
        {
            errors["sort"] = ["Unsupported sort mode."];
        }

        if (!WorkItemStatusCodec.TryParse(request.Status, out _))
        {
            errors["status"] = ["Unsupported status value."];
        }

        if (request.Page is < 1)
        {
            errors["page"] = ["Page must be greater than 0."];
        }

        if (request.PageSize is < 1)
        {
            errors["pageSize"] = ["Page size must be greater than 0."];
        }

        if (request.MinimumPriority is < 0)
        {
            errors["minimumPriority"] = ["minimumPriority must be greater than or equal to 0."];
        }

        if (request.CreatedFrom.HasValue && request.CreatedTo.HasValue && request.CreatedFrom > request.CreatedTo)
        {
            errors["createdFrom"] = ["createdFrom must be earlier than or equal to createdTo."];
        }

        return errors;
    }

    private static DateTimeOffset NormalizeTimestamp(DateTimeOffset value) => value.ToUniversalTime();
}

internal sealed record GetWorkItemsRequest(
    Guid? OwnerId,
    string? Status,
    DateTimeOffset? CreatedFrom,
    DateTimeOffset? CreatedTo,
    short? MinimumPriority,
    string? Sort,
    int? Page,
    int? PageSize);

internal sealed record GetWorkItemsResponse(
    IReadOnlyList<WorkItemResponse> Items,
    int Page,
    int PageSize,
    string Sort);
