export const listWorkItemsSql = `
WITH parameters AS (
  SELECT
    $1::uuid AS tenant_id,
    $2::text AS status,
    $3::int AS page_size
)
SELECT item.id, item.status, item.title
FROM work_items AS item
CROSS JOIN parameters
WHERE item.tenant_id = parameters.tenant_id
  AND (parameters.status IS NULL OR item.status = parameters.status)
ORDER BY item.id
LIMIT (SELECT page_size FROM parameters);
`;
