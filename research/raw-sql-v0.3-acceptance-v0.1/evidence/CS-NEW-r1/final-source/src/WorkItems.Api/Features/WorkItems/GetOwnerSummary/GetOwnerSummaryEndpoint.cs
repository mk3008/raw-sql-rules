using System.Data;
using System.Globalization;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Http.HttpResults;
using Npgsql;
using NpgsqlTypes;
using WorkItems.Api.Features.WorkItems.GetWorkItems;
using WorkItems.Api.Infrastructure;

namespace WorkItems.Api.Features.WorkItems.GetOwnerSummary;

internal static partial class GetOwnerSummaryEndpoint
{
    public static RouteGroupBuilder MapGetOwnerSummary(this RouteGroupBuilder group)
    {
        group.MapGet("/owner-summary", HandleAsync);
        return group;
    }

    private static async Task<Results<Ok<GetOwnerSummaryResponse>, ValidationProblem>> HandleAsync(
        HttpRequest httpRequest,
        GetOwnerSummaryHandler handler,
        CancellationToken cancellationToken)
    {
        if (!GetOwnerSummaryRequest.TryCreate(httpRequest.Query, out var request, out var errors))
        {
            return TypedResults.ValidationProblem(errors);
        }

        var response = await handler.HandleAsync(request, cancellationToken);
        return TypedResults.Ok(response);
    }
}

internal sealed class GetOwnerSummaryHandler(NpgsqlDataSource dataSource, SqlFileLoader sqlFileLoader)
{
    public async Task<GetOwnerSummaryResponse> HandleAsync(
        GetOwnerSummaryRequest request,
        CancellationToken cancellationToken)
    {
        await using var connection = await dataSource.OpenConnectionAsync(cancellationToken);
        await using var command = new NpgsqlCommand(
            sqlFileLoader.Load("Features", "WorkItems", "GetOwnerSummary", "GetOwnerSummary.sql"),
            connection);

        command.Parameters.Add(new NpgsqlParameter<Guid>("owner_id", NpgsqlDbType.Uuid)
        {
            TypedValue = request.OwnerId
        });
        command.Parameters.Add(new NpgsqlParameter<DateTimeOffset>("from", NpgsqlDbType.TimestampTz)
        {
            TypedValue = request.From
        });

        var statuses = new List<OwnerStatusSummary>();
        await using var reader = await command.ExecuteReaderAsync(CommandBehavior.SequentialAccess, cancellationToken);
        while (await reader.ReadAsync(cancellationToken))
        {
            statuses.Add(new OwnerStatusSummary(
                WorkItemStatusExtensions.FromDatabaseValue(reader.GetInt16(0)).ToApiValue(),
                reader.GetInt64(1),
                reader.GetInt64(2)));
        }

        return new GetOwnerSummaryResponse(request.OwnerId, request.From, statuses);
    }
}

internal sealed partial record GetOwnerSummaryRequest(Guid OwnerId, DateTimeOffset From)
{
    private static readonly HashSet<string> AllowedKeys = new(StringComparer.Ordinal)
    {
        "ownerId",
        "from"
    };

    [GeneratedRegex("^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d{1,7})?(?:Z|[+-]\\d{2}:\\d{2})$")]
    private static partial Regex Iso8601Timestamp();

    public static bool TryCreate(
        IQueryCollection query,
        out GetOwnerSummaryRequest request,
        out Dictionary<string, string[]> errors)
    {
        errors = new Dictionary<string, string[]>(StringComparer.Ordinal);

        foreach (var entry in query)
        {
            if (!AllowedKeys.Contains(entry.Key))
            {
                errors[entry.Key] = ["Query parameter is not supported."];
            }
            else if (entry.Value.Count != 1)
            {
                errors[entry.Key] = ["Query parameter must be supplied exactly once."];
            }
        }

        var ownerIdText = GetSingleValue(query, "ownerId", errors);
        var fromText = GetSingleValue(query, "from", errors);

        var ownerId = default(Guid);
        if (ownerIdText is not null && !Guid.TryParseExact(ownerIdText, "D", out ownerId))
        {
            errors["ownerId"] = ["ownerId must be a UUID."];
        }

        var from = default(DateTimeOffset);
        if (fromText is not null &&
            (!Iso8601Timestamp().IsMatch(fromText) ||
             !DateTimeOffset.TryParse(fromText, CultureInfo.InvariantCulture, DateTimeStyles.None, out from)))
        {
            errors["from"] = ["from must be an ISO-8601 timestamp with an offset."];
        }

        if (errors.Count != 0)
        {
            request = default!;
            return false;
        }

        request = new GetOwnerSummaryRequest(ownerId, from);
        return true;
    }

    private static string? GetSingleValue(
        IQueryCollection query,
        string key,
        Dictionary<string, string[]> errors)
    {
        if (!query.TryGetValue(key, out var values) || values.Count == 0)
        {
            errors[key] = ["Query parameter is required."];
            return null;
        }

        if (values.Count != 1)
        {
            return null;
        }

        if (string.IsNullOrEmpty(values[0]))
        {
            errors[key] = ["Query parameter must not be empty."];
            return null;
        }

        return values[0];
    }
}

internal sealed record GetOwnerSummaryResponse(
    Guid OwnerId,
    DateTimeOffset From,
    IReadOnlyList<OwnerStatusSummary> Statuses);

internal sealed record OwnerStatusSummary(
    string Status,
    long CompletedCount,
    long NonCompletedCount);
