CREATE TABLE inventory_items (
  id uuid PRIMARY KEY, sku text NOT NULL, quantity integer NOT NULL CHECK (quantity >= 0),
  is_active boolean NOT NULL, created_at timestamptz NOT NULL
);
CREATE TABLE inventory_reservations (
  request_id uuid PRIMARY KEY, inventory_item_id uuid NOT NULL REFERENCES inventory_items(id),
  quantity integer NOT NULL CHECK (quantity > 0), created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE inventory_events (
  id bigserial PRIMARY KEY, request_id uuid NOT NULL, inventory_item_id uuid NOT NULL REFERENCES inventory_items(id),
  event_type text NOT NULL, quantity integer NOT NULL CHECK (quantity > 0), created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (request_id, event_type)
);
