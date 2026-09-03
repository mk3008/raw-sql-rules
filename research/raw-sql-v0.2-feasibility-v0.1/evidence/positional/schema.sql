CREATE TABLE work_items (
  id integer PRIMARY KEY,
  tenant_id uuid NOT NULL,
  status text NOT NULL,
  title text NOT NULL
);

INSERT INTO work_items (id, tenant_id, status, title) VALUES
  (1, '11111111-1111-1111-1111-111111111111', 'open', 'first'),
  (2, '11111111-1111-1111-1111-111111111111', 'closed', 'second'),
  (3, '22222222-2222-2222-2222-222222222222', 'open', 'other tenant');
