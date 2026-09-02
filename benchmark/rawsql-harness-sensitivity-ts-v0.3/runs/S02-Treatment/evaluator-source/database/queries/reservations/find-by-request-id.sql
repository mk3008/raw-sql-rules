SELECT request_id, inventory_item_id, quantity
FROM inventory_reservations
WHERE request_id = :request_id;
