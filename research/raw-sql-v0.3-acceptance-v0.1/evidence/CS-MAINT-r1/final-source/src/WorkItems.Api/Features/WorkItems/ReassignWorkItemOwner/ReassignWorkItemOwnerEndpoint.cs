using Microsoft.AspNetCore.Http.HttpResults;
using Npgsql;
using NpgsqlTypes;
using WorkItems.Api.Infrastructure;

namespace WorkItems.Api.Features.WorkItems.ReassignWorkItemOwner;

internal static class ReassignWorkItemOwnerEndpoint
{
    public static RouteGroupBuilder MapReassignWorkItemOwner(this RouteGroupBuilder group)
    {
        group.MapPatch("/{id:guid}/owner", HandleAsync);
        return group;
    }

    private static async Task<Results<NoContent, NotFound>> HandleAsync(
        Guid id,
        ReassignWorkItemOwnerRequest request,
        ReassignWorkItemOwnerHandler handler,
        CancellationToken cancellationToken)
    {
        var reassigned = await handler.HandleAsync(id, request.OwnerId, cancellationToken);
        return reassigned
            ? TypedResults.NoContent()
            : TypedResults.NotFound();
    }
}

internal sealed record ReassignWorkItemOwnerRequest(Guid OwnerId);

internal sealed class ReassignWorkItemOwnerHandler(
    NpgsqlDataSource dataSource,
    SqlFileLoader sqlFileLoader,
    TimeProvider timeProvider)
{
    public async Task<bool> HandleAsync(Guid id, Guid ownerId, CancellationToken cancellationToken)
    {
        var occurredAt = timeProvider.GetUtcNow();

        await using var connection = await dataSource.OpenConnectionAsync(cancellationToken);
        await using var transaction = await connection.BeginTransactionAsync(cancellationToken);

        await using var updateCommand = new NpgsqlCommand(
            sqlFileLoader.Load("Features", "WorkItems", "ReassignWorkItemOwner", "UpdateWorkItemOwner.sql"),
            connection,
            transaction);
        updateCommand.Parameters.Add(new NpgsqlParameter<Guid>("id", NpgsqlDbType.Uuid) { TypedValue = id });
        updateCommand.Parameters.Add(new NpgsqlParameter<Guid>("owner_id", NpgsqlDbType.Uuid) { TypedValue = ownerId });

        var updatedWorkItemId = await updateCommand.ExecuteScalarAsync(cancellationToken);
        if (updatedWorkItemId is null)
        {
            await using var findCommand = new NpgsqlCommand(
                sqlFileLoader.Load("Features", "WorkItems", "ReassignWorkItemOwner", "FindWorkItemById.sql"),
                connection,
                transaction);
            findCommand.Parameters.Add(new NpgsqlParameter<Guid>("id", NpgsqlDbType.Uuid) { TypedValue = id });

            var existingWorkItemId = await findCommand.ExecuteScalarAsync(cancellationToken);
            await transaction.RollbackAsync(cancellationToken);
            return existingWorkItemId is not null;
        }

        await using var insertEventCommand = new NpgsqlCommand(
            sqlFileLoader.Load("Features", "WorkItems", "ReassignWorkItemOwner", "InsertOwnerChangedEvent.sql"),
            connection,
            transaction);
        insertEventCommand.Parameters.Add(new NpgsqlParameter<Guid>("id", NpgsqlDbType.Uuid) { TypedValue = Guid.NewGuid() });
        insertEventCommand.Parameters.Add(new NpgsqlParameter<Guid>("work_item_id", NpgsqlDbType.Uuid) { TypedValue = id });
        insertEventCommand.Parameters.Add(new NpgsqlParameter<DateTimeOffset>("occurred_at", NpgsqlDbType.TimestampTz)
        {
            TypedValue = occurredAt
        });

        await insertEventCommand.ExecuteNonQueryAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        return true;
    }
}
