SELECT
    id,
    title,
    owner_id,
    status,
    priority,
    created_at,
    completed_at
FROM work_items
WHERE status = @success_status
  AND completed_at IS NOT NULL
  AND (@owner_id IS NULL OR owner_id = @owner_id)
  AND (@completed_from IS NULL OR completed_at >= @completed_from)
  AND (@completed_to IS NULL OR completed_at <= @completed_to)
ORDER BY completed_at DESC, id ASC;
