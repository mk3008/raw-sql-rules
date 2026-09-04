CREATE TABLE work_items (
  id integer PRIMARY KEY,
  tenant_id uuid NOT NULL,
  title text NOT NULL,
  status text NOT NULL CHECK (status IN ('open', 'closed')),
  created_at timestamptz NOT NULL
);

INSERT INTO work_items (id, tenant_id, title, status, created_at) VALUES
  (1, '11111111-1111-1111-1111-111111111111', 'Alpha', 'open', '2024-01-01T00:00:00Z'),
  (2, '11111111-1111-1111-1111-111111111111', 'Beta', 'closed', '2024-02-01T00:00:00Z'),
  (3, '22222222-2222-2222-2222-222222222222', 'Private', 'open', '2024-03-01T00:00:00Z');
