using Npgsql;
using NpgsqlTypes;
using WorkItems.Api.Infrastructure;

namespace WorkItems.Api.Features.WorkItems.CompleteWorkItem;

internal static class CompleteWorkItemEndpoint
{
    private static readonly string CompleteWorkItemSql =
        SqlAsset.Load("Features", "WorkItems", "CompleteWorkItem", "complete_work_item.sql");

    public static IEndpointRouteBuilder MapCompleteWorkItem(this IEndpointRouteBuilder app)
    {
        app.MapPost("/work-items/{id:guid}/complete", HandleAsync);
        return app;
    }

    private static async Task<IResult> HandleAsync(
        Guid id,
        NpgsqlDataSource dataSource,
        TimeProvider timeProvider,
        CancellationToken cancellationToken)
    {
        var completedAt = timeProvider.GetUtcNow();

        await using var command = dataSource.CreateCommand(CompleteWorkItemSql);
        command.Parameters.AddWithValue("work_item_id", id);
        command.Parameters.Add(new NpgsqlParameter("success_status", NpgsqlDbType.Smallint)
        {
            Value = (short)WorkItemStatus.Success
        });
        command.Parameters.AddWithValue("completed_at", completedAt);
        command.Parameters.AddWithValue("event_id", Guid.NewGuid());
        command.Parameters.AddWithValue("event_type", "completed");

        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        if (!await reader.ReadAsync(cancellationToken))
        {
            return Results.NotFound();
        }

        return Results.Ok(WorkItemReader.Read(reader).ToResponse());
    }
}
