WITH updated AS (
    UPDATE work_items
    SET status = @success_status,
        completed_at = @completed_at
    WHERE id = @work_item_id
    RETURNING
        id,
        title,
        owner_id,
        status,
        priority,
        created_at,
        completed_at
),
inserted_event AS (
    -- The event is written from the updated row so the state change and event stay atomic.
    INSERT INTO work_item_events (id, work_item_id, event_type, occurred_at)
    SELECT @event_id, id, @event_type, @completed_at
    FROM updated
)
SELECT
    id,
    title,
    owner_id,
    status,
    priority,
    created_at,
    completed_at
FROM updated;
