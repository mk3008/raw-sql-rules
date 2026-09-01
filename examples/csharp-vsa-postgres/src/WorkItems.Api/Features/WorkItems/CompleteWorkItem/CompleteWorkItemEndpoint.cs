using Microsoft.AspNetCore.Http.HttpResults;
using Npgsql;
using NpgsqlTypes;
using WorkItems.Api.Infrastructure;

namespace WorkItems.Api.Features.WorkItems.CompleteWorkItem;

internal static class CompleteWorkItemEndpoint
{
    public static RouteGroupBuilder MapCompleteWorkItem(this RouteGroupBuilder group)
    {
        group.MapPost("/{id:guid}/complete", HandleAsync);
        return group;
    }

    private static async Task<Results<NoContent, NotFound>> HandleAsync(
        Guid id,
        CompleteWorkItemHandler handler,
        CancellationToken cancellationToken)
    {
        var completed = await handler.HandleAsync(id, cancellationToken);
        return completed
            ? TypedResults.NoContent()
            : TypedResults.NotFound();
    }
}

internal sealed class CompleteWorkItemHandler(
    NpgsqlDataSource dataSource,
    SqlFileLoader sqlFileLoader,
    TimeProvider timeProvider)
{
    public async Task<bool> HandleAsync(Guid id, CancellationToken cancellationToken)
    {
        var completedAt = timeProvider.GetUtcNow();

        await using var connection = await dataSource.OpenConnectionAsync(cancellationToken);
        await using var transaction = await connection.BeginTransactionAsync(cancellationToken);

        await using var updateCommand = new NpgsqlCommand(
            sqlFileLoader.Load("Features", "WorkItems", "CompleteWorkItem", "UpdateWorkItemAsComplete.sql"),
            connection,
            transaction);
        updateCommand.Parameters.Add(new NpgsqlParameter<Guid>("id", NpgsqlDbType.Uuid) { TypedValue = id });
        updateCommand.Parameters.Add(new NpgsqlParameter<DateTimeOffset>("completed_at", NpgsqlDbType.TimestampTz)
        {
            TypedValue = completedAt
        });

        var updatedWorkItemId = await updateCommand.ExecuteScalarAsync(cancellationToken);
        if (updatedWorkItemId is null)
        {
            await using var findCommand = new NpgsqlCommand(
                sqlFileLoader.Load("Features", "WorkItems", "CompleteWorkItem", "FindWorkItemById.sql"),
                connection,
                transaction);
            findCommand.Parameters.Add(new NpgsqlParameter<Guid>("id", NpgsqlDbType.Uuid) { TypedValue = id });

            var existingWorkItemId = await findCommand.ExecuteScalarAsync(cancellationToken);
            await transaction.RollbackAsync(cancellationToken);
            return existingWorkItemId is not null;
        }

        await using var insertEventCommand = new NpgsqlCommand(
            sqlFileLoader.Load("Features", "WorkItems", "CompleteWorkItem", "InsertWorkItemCompletedEvent.sql"),
            connection,
            transaction);
        insertEventCommand.Parameters.Add(new NpgsqlParameter<Guid>("id", NpgsqlDbType.Uuid) { TypedValue = Guid.NewGuid() });
        insertEventCommand.Parameters.Add(new NpgsqlParameter<Guid>("work_item_id", NpgsqlDbType.Uuid) { TypedValue = id });
        insertEventCommand.Parameters.Add(new NpgsqlParameter<DateTimeOffset>("occurred_at", NpgsqlDbType.TimestampTz)
        {
            TypedValue = completedAt
        });

        await insertEventCommand.ExecuteNonQueryAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        return true;
    }
}
