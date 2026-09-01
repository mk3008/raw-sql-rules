UPDATE work_items
SET status = 2,
    completed_at = @completed_at
WHERE id = @id
RETURNING id;
