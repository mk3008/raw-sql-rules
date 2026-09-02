SELECT
  COUNT(*) AS "activeCount",
  COALESCE(SUM(quantity), 0) AS "totalQuantity",
  MAX(created_at) AS "newestCreatedAt"
FROM inventory_items
WHERE is_active = TRUE;
