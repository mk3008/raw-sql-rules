// Authoritative SQL for GET /acceptance/items. Parameters are named so the
// query and its bindings can be reviewed together.
export const acceptanceItemsSql = `
  SELECT id, tenant_id, name, price, status, created_at
  FROM items
  WHERE tenant_id = :tenantId
    AND (CAST(:status AS text) IS NULL OR status = CAST(:status AS text))
  ORDER BY created_at ASC
  LIMIT CAST(:limit AS integer)
`;
