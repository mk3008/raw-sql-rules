using System.Data;
using Microsoft.AspNetCore.Http.HttpResults;
using Npgsql;
using NpgsqlTypes;
using WorkItems.Api.Features.WorkItems.GetWorkItems;
using WorkItems.Api.Infrastructure;

namespace WorkItems.Api.Features.WorkItems.GetCompletedWorkItems;

internal static class GetCompletedWorkItemsEndpoint
{
    public static RouteGroupBuilder MapGetCompletedWorkItems(this RouteGroupBuilder group)
    {
        group.MapGet("/completed", HandleAsync);
        return group;
    }

    private static async Task<Results<Ok<GetCompletedWorkItemsResponse>, ValidationProblem>> HandleAsync(
        [AsParameters] GetCompletedWorkItemsRequest request,
        GetCompletedWorkItemsHandler handler,
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

internal sealed class GetCompletedWorkItemsHandler(NpgsqlDataSource dataSource, SqlFileLoader sqlFileLoader)
{
    public async Task<GetCompletedWorkItemsResponse> HandleAsync(
        GetCompletedWorkItemsRequest request,
        CancellationToken cancellationToken)
    {
        await using var connection = await dataSource.OpenConnectionAsync(cancellationToken);
        await using var command = new NpgsqlCommand(
            sqlFileLoader.Load("Features", "WorkItems", "GetCompletedWorkItems", "ListCompletedWorkItems.sql"),
            connection);

        command.Parameters.Add(new NpgsqlParameter<Guid?>("owner_id", NpgsqlDbType.Uuid)
        {
            TypedValue = request.OwnerId
        });
        command.Parameters.Add(new NpgsqlParameter<DateTimeOffset?>("completed_from", NpgsqlDbType.TimestampTz)
        {
            TypedValue = request.CompletedFrom
        });
        command.Parameters.Add(new NpgsqlParameter<DateTimeOffset?>("completed_to", NpgsqlDbType.TimestampTz)
        {
            TypedValue = request.CompletedTo
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
                reader.GetFieldValue<DateTimeOffset>(6)));
        }

        return new GetCompletedWorkItemsResponse(items);
    }
}

internal sealed record GetCompletedWorkItemsRequest(
    Guid? OwnerId,
    DateTimeOffset? CompletedFrom,
    DateTimeOffset? CompletedTo)
{
    public Dictionary<string, string[]>? Validate()
    {
        Dictionary<string, string[]>? errors = null;

        if (CompletedFrom is not null && CompletedTo is not null && CompletedFrom > CompletedTo)
        {
            errors = AddError(errors, nameof(CompletedFrom), "CompletedFrom must be earlier than or equal to CompletedTo.");
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

internal sealed record GetCompletedWorkItemsResponse(
    IReadOnlyList<WorkItemListItem> Items);
