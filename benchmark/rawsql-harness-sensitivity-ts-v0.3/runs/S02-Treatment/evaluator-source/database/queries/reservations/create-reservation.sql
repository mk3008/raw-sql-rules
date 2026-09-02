INSERT INTO inventory_reservations (request_id, inventory_item_id, quantity)
VALUES (:request_id, :inventory_item_id, :quantity)
RETURNING request_id, inventory_item_id, quantity;
