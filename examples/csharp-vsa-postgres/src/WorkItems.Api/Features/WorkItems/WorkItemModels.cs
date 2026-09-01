using Npgsql;

namespace WorkItems.Api.Features.WorkItems;

internal enum WorkItemStatus : short
{
    Pending = 0,
    InProgress = 1,
    Success = 2,
    Failed = 3
}

internal static class WorkItemStatusCodec
{
    public static bool TryParse(string? value, out WorkItemStatus? status)
    {
        status = value?.Trim().ToLowerInvariant() switch
        {
            null or "" => null,
            "pending" => WorkItemStatus.Pending,
            "in_progress" => WorkItemStatus.InProgress,
            "success" => WorkItemStatus.Success,
            "failed" => WorkItemStatus.Failed,
            _ => null
        };

        return value is null or "" || status is not null;
    }

    public static string ToApiValue(this WorkItemStatus status) => status switch
    {
        WorkItemStatus.Pending => "pending",
        WorkItemStatus.InProgress => "in_progress",
        WorkItemStatus.Success => "success",
        WorkItemStatus.Failed => "failed",
        _ => throw new ArgumentOutOfRangeException(nameof(status), status, null)
    };
}

internal sealed record WorkItemRecord(
    Guid Id,
    string Title,
    Guid OwnerId,
    WorkItemStatus Status,
    short Priority,
    DateTimeOffset CreatedAt,
    DateTimeOffset? CompletedAt)
{
    public WorkItemResponse ToResponse() =>
        new(Id, Title, OwnerId, Status.ToApiValue(), Priority, CreatedAt, CompletedAt);
}

internal sealed record WorkItemResponse(
    Guid Id,
    string Title,
    Guid OwnerId,
    string Status,
    short Priority,
    DateTimeOffset CreatedAt,
    DateTimeOffset? CompletedAt);

internal static class WorkItemReader
{
    public static WorkItemRecord Read(NpgsqlDataReader reader) =>
        new(
            reader.GetGuid(0),
            reader.GetString(1),
            reader.GetGuid(2),
            (WorkItemStatus)reader.GetInt16(3),
            reader.GetInt16(4),
            reader.GetFieldValue<DateTimeOffset>(5),
            reader.IsDBNull(6) ? null : reader.GetFieldValue<DateTimeOffset>(6));
}
