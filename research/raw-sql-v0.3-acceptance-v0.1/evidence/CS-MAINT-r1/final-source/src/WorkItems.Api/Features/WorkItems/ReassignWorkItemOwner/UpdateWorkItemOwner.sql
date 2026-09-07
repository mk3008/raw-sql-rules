UPDATE work_items
SET owner_id = @owner_id
WHERE id = @id
  AND owner_id <> @owner_id
RETURNING id;
