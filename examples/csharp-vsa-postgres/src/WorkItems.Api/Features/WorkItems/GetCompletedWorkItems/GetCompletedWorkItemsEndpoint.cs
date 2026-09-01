using Microsoft.AspNetCore.Mvc;
using Npgsql;
using NpgsqlTypes;
using WorkItems.Api.Infrastructure;

namespace WorkItems.Api.Features.WorkItems.GetCompletedWorkItems;

internal static class GetCompletedWorkItemsEndpoint
{
    private static readonly string Sql =
        SqlAsset.Load("Features", "WorkItems", "GetCompletedWorkItems", "list_completed_work_items.sql");

    public static IEndpointRouteBuilder MapGetCompletedWorkItems(this IEndpointRouteBuilder app)
    {
        app.MapGet("/work-items/completed", HandleAsync);
        return app;
    }

    private static async Task<IResult> HandleAsync(
        [AsParameters] GetCompletedWorkItemsRequest request,
        NpgsqlDataSource dataSource,
        CancellationToken cancellationToken)
    {
        var errors = Validate(request);
        if (errors.Count > 0)
        {
            return Results.ValidationProblem(errors);
        }

        await using var command = dataSource.CreateCommand(Sql);
        command.Parameters.Add(new NpgsqlParameter("success_status", NpgsqlDbType.Smallint)
        {
            Value = (short)WorkItemStatus.Success
        });
        command.Parameters.Add(new NpgsqlParameter("owner_id", NpgsqlDbType.Uuid)
        {
            Value = request.OwnerId.HasValue ? request.OwnerId.Value : DBNull.Value
        });
        command.Parameters.Add(new NpgsqlParameter("completed_from", NpgsqlDbType.TimestampTz)
        {
            Value = request.CompletedFrom.HasValue ? request.CompletedFrom.Value.ToUniversalTime() : DBNull.Value
        });
        command.Parameters.Add(new NpgsqlParameter("completed_to", NpgsqlDbType.TimestampTz)
        {
            Value = request.CompletedTo.HasValue ? request.CompletedTo.Value.ToUniversalTime() : DBNull.Value
        });

        var items = new List<WorkItemResponse>();
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        while (await reader.ReadAsync(cancellationToken))
        {
            items.Add(WorkItemReader.Read(reader).ToResponse());
        }

        return Results.Ok(items);
    }

    private static Dictionary<string, string[]> Validate(GetCompletedWorkItemsRequest request)
    {
        var errors = new Dictionary<string, string[]>(StringComparer.Ordinal);

        if (request.CompletedFrom.HasValue && request.CompletedTo.HasValue && request.CompletedFrom > request.CompletedTo)
        {
            errors["completedFrom"] = ["completedFrom must be earlier than or equal to completedTo."];
        }

        return errors;
    }
}

internal sealed record GetCompletedWorkItemsRequest(
    Guid? OwnerId,
    DateTimeOffset? CompletedFrom,
    DateTimeOffset? CompletedTo);
