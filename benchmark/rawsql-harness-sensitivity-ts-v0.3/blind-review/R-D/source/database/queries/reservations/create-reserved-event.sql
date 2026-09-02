INSERT INTO inventory_events (request_id, inventory_item_id, event_type, quantity)
VALUES (:request_id, :inventory_item_id, 'reserved', :quantity);
