INSERT INTO work_item_events (id, work_item_id, event_type, occurred_at)
VALUES (@id, @work_item_id, 'owner_changed', @occurred_at);
