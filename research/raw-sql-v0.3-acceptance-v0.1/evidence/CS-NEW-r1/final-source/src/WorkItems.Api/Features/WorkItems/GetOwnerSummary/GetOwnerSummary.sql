SELECT
    status,
    COUNT(*) FILTER (WHERE status = 2) AS completed_count,
    COUNT(*) FILTER (WHERE status <> 2) AS non_completed_count
FROM work_items
WHERE owner_id = @owner_id
  AND created_at >= @from
GROUP BY status
ORDER BY status ASC;
