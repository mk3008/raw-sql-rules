export const listWorkItemsSql = `
  WITH input AS (
    SELECT
      $1::uuid AS tenantId,
      $2::text AS status,
      $3::text AS sort
  )
  SELECT work_items.id, work_items.title, work_items.status, work_items.created_at
  FROM work_items
  CROSS JOIN input
  WHERE work_items.tenant_id = input.tenantId
    AND (input.status IS NULL OR work_items.status = input.status)
  ORDER BY
    CASE WHEN input.sort = 'createdAt' THEN work_items.created_at END ASC,
    CASE WHEN input.sort = 'title' THEN work_items.title END ASC
`;
