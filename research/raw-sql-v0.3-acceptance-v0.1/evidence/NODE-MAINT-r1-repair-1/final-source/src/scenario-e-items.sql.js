// Authoritative application SQL for GET /scenario-e/items.
// The node-postgres positional form is mechanically lowered from these names.
export const SELECT_SCENARIO_E_ITEMS = `
  SELECT id, tenant_id, name, price, status, created_at
  FROM items
  WHERE tenant_id = :tenantId
    AND (:status::text IS NULL OR status = :status::text)
    AND (:minPrice::integer IS NULL OR price >= :minPrice::integer)
  ORDER BY created_at
  LIMIT :limit
`;
