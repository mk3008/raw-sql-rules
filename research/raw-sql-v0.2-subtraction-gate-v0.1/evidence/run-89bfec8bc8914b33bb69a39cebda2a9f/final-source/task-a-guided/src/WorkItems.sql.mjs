export const listWorkItemsByCreatedAtSql = `
  WITH input AS (
    SELECT $1::uuid AS tenantId, $2::text AS status
  )
  SELECT work_items.id, work_items.title, work_items.status, work_items.created_at
  FROM work_items
  CROSS JOIN input
  WHERE work_items.tenant_id = input.tenantId
    AND (input.status IS NULL OR work_items.status = input.status)
  ORDER BY work_items.created_at ASC
`;

export const listWorkItemsByTitleSql = `
  WITH input AS (
    SELECT $1::uuid AS tenantId, $2::text AS status
  )
  SELECT work_items.id, work_items.title, work_items.status, work_items.created_at
  FROM work_items
  CROSS JOIN input
  WHERE work_items.tenant_id = input.tenantId
    AND (input.status IS NULL OR work_items.status = input.status)
  ORDER BY work_items.title ASC
`;
