using System.Data;
using System.Diagnostics;
using Microsoft.AspNetCore.Http.HttpResults;
using Npgsql;
using NpgsqlTypes;
using WorkItems.Api.Infrastructure;

namespace WorkItems.Api.Features.WorkItems.GetWorkItems;

internal static class GetWorkItemsEndpoint
{
    public static RouteGroupBuilder MapGetWorkItems(this RouteGroupBuilder group)
    {
        group.MapGet("/", HandleAsync);
        return group;
    }

    private static async Task<Results<Ok<GetWorkItemsResponse>, ValidationProblem>> HandleAsync(
        [AsParameters] GetWorkItemsRequest request,
        GetWorkItemsHandler handler,
        CancellationToken cancellationToken)
    {
        var validationErrors = request.Validate();
        if (validationErrors is not null)
        {
            return TypedResults.ValidationProblem(validationErrors);
        }

        var response = await handler.HandleAsync(request, cancellationToken);
        return TypedResults.Ok(response);
    }
}

internal sealed class GetWorkItemsHandler(NpgsqlDataSource dataSource, SqlFileLoader sqlFileLoader)
{
    private const int DefaultPageSize = 50;
    private const int MaxPageSize = 100;

    public async Task<GetWorkItemsResponse> HandleAsync(
        GetWorkItemsRequest request,
        CancellationToken cancellationToken)
    {
        var sortMode = WorkItemSortModeExtensions.ParseOrDefault(request.Sort);
        var pageSize = request.PageSize ?? DefaultPageSize;
        string[] sqlPathSegments = sortMode switch
        {
            WorkItemSortMode.CreatedDesc => ["Features", "WorkItems", "GetWorkItems", "ListWorkItems.CreatedDesc.sql"],
            WorkItemSortMode.CreatedAsc => ["Features", "WorkItems", "GetWorkItems", "ListWorkItems.CreatedAsc.sql"],
            WorkItemSortMode.PriorityDesc => ["Features", "WorkItems", "GetWorkItems", "ListWorkItems.PriorityDesc.sql"],
            WorkItemSortMode.TitleAsc => ["Features", "WorkItems", "GetWorkItems", "ListWorkItems.TitleAsc.sql"],
            _ => throw new UnreachableException()
        };

        await using var connection = await dataSource.OpenConnectionAsync(cancellationToken);
        await using var command = new NpgsqlCommand(sqlFileLoader.Load(sqlPathSegments), connection);

        command.Parameters.Add(new NpgsqlParameter<Guid?>("owner_id", NpgsqlDbType.Uuid)
        {
            TypedValue = request.OwnerId
        });
        command.Parameters.Add(new NpgsqlParameter<short?>("status", NpgsqlDbType.Smallint)
        {
            TypedValue = request.Status is not null && WorkItemStatusExtensions.TryParse(request.Status, out var status)
                ? status.ToDatabaseValue()
                : null
        });
        command.Parameters.Add(new NpgsqlParameter<DateTimeOffset?>("created_from", NpgsqlDbType.TimestampTz)
        {
            TypedValue = request.CreatedFrom
        });
        command.Parameters.Add(new NpgsqlParameter<DateTimeOffset?>("created_to", NpgsqlDbType.TimestampTz)
        {
            TypedValue = request.CreatedTo
        });
        command.Parameters.Add(new NpgsqlParameter<short?>("min_priority", NpgsqlDbType.Smallint)
        {
            TypedValue = request.MinPriority
        });
        command.Parameters.Add(new NpgsqlParameter<string?>("title_prefix", NpgsqlDbType.Text)
        {
            TypedValue = request.TitlePrefix
        });
        command.Parameters.Add(new NpgsqlParameter<int>("limit", NpgsqlDbType.Integer)
        {
            TypedValue = Math.Min(pageSize, MaxPageSize)
        });

        var items = new List<WorkItemListItem>();

        await using var reader = await command.ExecuteReaderAsync(CommandBehavior.SequentialAccess, cancellationToken);
        while (await reader.ReadAsync(cancellationToken))
        {
            items.Add(new WorkItemListItem(
                reader.GetGuid(0),
                reader.GetString(1),
                reader.GetGuid(2),
                WorkItemStatusExtensions.FromDatabaseValue(reader.GetInt16(3)).ToApiValue(),
                reader.GetInt16(4),
                reader.GetFieldValue<DateTimeOffset>(5),
                reader.IsDBNull(6) ? null : reader.GetFieldValue<DateTimeOffset>(6)));
        }

        return new GetWorkItemsResponse(items, sortMode.ToApiValue(), Math.Min(pageSize, MaxPageSize));
    }
}

internal sealed record GetWorkItemsRequest(
    Guid? OwnerId,
    string? Status,
    DateTimeOffset? CreatedFrom,
    DateTimeOffset? CreatedTo,
    short? MinPriority,
    string? TitlePrefix,
    string? Sort,
    int? PageSize)
{
    public Dictionary<string, string[]>? Validate()
    {
        Dictionary<string, string[]>? errors = null;

        if (Status is not null && !WorkItemStatusExtensions.TryParse(Status, out _))
        {
            errors = AddError(errors, nameof(Status), "Status must be one of: pending, in_progress, success, failed.");
        }

        if (Sort is not null && !WorkItemSortModeExtensions.TryParse(Sort, out _))
        {
            errors = AddError(errors, nameof(Sort), "Sort must be one of: created_desc, created_asc, priority_desc, title_asc.");
        }

        if (PageSize is <= 0)
        {
            errors = AddError(errors, nameof(PageSize), "PageSize must be greater than zero.");
        }

        if (CreatedFrom is not null && CreatedTo is not null && CreatedFrom > CreatedTo)
        {
            errors = AddError(errors, nameof(CreatedFrom), "CreatedFrom must be earlier than or equal to CreatedTo.");
        }

        return errors;
    }

    private static Dictionary<string, string[]> AddError(
        Dictionary<string, string[]>? errors,
        string key,
        string message)
    {
        errors ??= new Dictionary<string, string[]>(StringComparer.Ordinal);
        errors[key] = [message];
        return errors;
    }
}

internal sealed record GetWorkItemsResponse(
    IReadOnlyList<WorkItemListItem> Items,
    string Sort,
    int PageSize);

internal sealed record WorkItemListItem(
    Guid Id,
    string Title,
    Guid OwnerId,
    string Status,
    short Priority,
    DateTimeOffset CreatedAt,
    DateTimeOffset? CompletedAt);

internal enum WorkItemSortMode
{
    CreatedDesc,
    CreatedAsc,
    PriorityDesc,
    TitleAsc
}

internal static class WorkItemSortModeExtensions
{
    public static bool TryParse(string value, out WorkItemSortMode mode)
    {
        switch (value)
        {
            case "created_desc":
                mode = WorkItemSortMode.CreatedDesc;
                return true;
            case "created_asc":
                mode = WorkItemSortMode.CreatedAsc;
                return true;
            case "priority_desc":
                mode = WorkItemSortMode.PriorityDesc;
                return true;
            case "title_asc":
                mode = WorkItemSortMode.TitleAsc;
                return true;
            default:
                mode = default;
                return false;
        }
    }

    public static WorkItemSortMode ParseOrDefault(string? value)
    {
        return value is not null && TryParse(value, out var mode)
            ? mode
            : WorkItemSortMode.CreatedDesc;
    }

    public static string ToApiValue(this WorkItemSortMode mode)
    {
        return mode switch
        {
            WorkItemSortMode.CreatedDesc => "created_desc",
            WorkItemSortMode.CreatedAsc => "created_asc",
            WorkItemSortMode.PriorityDesc => "priority_desc",
            WorkItemSortMode.TitleAsc => "title_asc",
            _ => throw new UnreachableException()
        };
    }
}

internal enum WorkItemStatus
{
    Pending = 0,
    InProgress = 1,
    Success = 2,
    Failed = 3
}

internal static class WorkItemStatusExtensions
{
    public static bool TryParse(string value, out WorkItemStatus status)
    {
        switch (value)
        {
            case "pending":
                status = WorkItemStatus.Pending;
                return true;
            case "in_progress":
                status = WorkItemStatus.InProgress;
                return true;
            case "success":
                status = WorkItemStatus.Success;
                return true;
            case "failed":
                status = WorkItemStatus.Failed;
                return true;
            default:
                status = default;
                return false;
        }
    }

    public static WorkItemStatus FromDatabaseValue(short value)
    {
        return value switch
        {
            0 => WorkItemStatus.Pending,
            1 => WorkItemStatus.InProgress,
            2 => WorkItemStatus.Success,
            3 => WorkItemStatus.Failed,
            _ => throw new InvalidOperationException($"Unsupported status value '{value}'.")
        };
    }

    public static short ToDatabaseValue(this WorkItemStatus status)
    {
        return (short)status;
    }

    public static string ToApiValue(this WorkItemStatus status)
    {
        return status switch
        {
            WorkItemStatus.Pending => "pending",
            WorkItemStatus.InProgress => "in_progress",
            WorkItemStatus.Success => "success",
            WorkItemStatus.Failed => "failed",
            _ => throw new UnreachableException()
        };
    }
}
