UPDATE inventory_items
SET quantity = quantity - :quantity
WHERE id = :inventory_item_id
  AND quantity >= :quantity
RETURNING id;
