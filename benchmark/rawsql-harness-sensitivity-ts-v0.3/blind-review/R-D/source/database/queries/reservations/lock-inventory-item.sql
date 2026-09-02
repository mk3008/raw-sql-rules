SELECT id
FROM inventory_items
WHERE id = :inventory_item_id
FOR UPDATE;
