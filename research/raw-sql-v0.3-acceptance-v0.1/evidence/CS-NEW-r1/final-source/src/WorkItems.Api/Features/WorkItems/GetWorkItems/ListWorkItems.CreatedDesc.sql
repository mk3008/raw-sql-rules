SELECT
    id,
    title,
    owner_id,
    status,
    priority,
    created_at,
    completed_at
FROM work_items
WHERE (@owner_id IS NULL OR owner_id = @owner_id)
  AND (@status IS NULL OR status = @status)
  AND (@created_from IS NULL OR created_at >= @created_from)
  AND (@created_to IS NULL OR created_at <= @created_to)
  AND (@min_priority IS NULL OR priority >= @min_priority)
ORDER BY created_at DESC, id
LIMIT @limit;
