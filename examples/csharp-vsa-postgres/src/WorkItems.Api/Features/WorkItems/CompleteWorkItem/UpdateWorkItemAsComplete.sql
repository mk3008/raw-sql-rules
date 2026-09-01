UPDATE work_items
SET status = 2,
    completed_at = @completed_at
WHERE id = @id
  AND (status <> 2 OR completed_at IS NULL)
RETURNING id;
