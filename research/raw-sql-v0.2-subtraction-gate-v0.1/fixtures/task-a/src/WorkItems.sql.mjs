export const listWorkItemsSql = `
  WITH input AS (
    SELECT $1::uuid AS tenantId
  )
  SELECT work_items.id, work_items.title, work_items.status, work_items.created_at
  FROM work_items
  CROSS JOIN input
  WHERE work_items.tenant_id = input.tenantId
  ORDER BY work_items.created_at ASC
`;
