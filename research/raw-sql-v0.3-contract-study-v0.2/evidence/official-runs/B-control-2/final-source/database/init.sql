CREATE TABLE tenants (
  id text PRIMARY KEY,
  name text NOT NULL
);

CREATE TABLE items (
  id uuid PRIMARY KEY,
  tenant_id text NOT NULL REFERENCES tenants(id),
  name text NOT NULL,
  price integer NOT NULL CHECK (price >= 0),
  status text NOT NULL CHECK (status IN ('active', 'inactive', 'archived')),
  created_at timestamptz NOT NULL
);

CREATE TABLE report_configs (
  report_name text PRIMARY KEY,
  description text NOT NULL,
  stored_text text NOT NULL
);

INSERT INTO tenants (id, name) VALUES
  ('tenant-a', 'Alpha'),
  ('tenant-b', 'Beta');

INSERT INTO items (id, tenant_id, name, price, status, created_at) VALUES
  ('10000000-0000-0000-0000-000000000001', 'tenant-a', 'alpha', 10, 'active', '2024-01-01T00:00:00Z'),
  ('10000000-0000-0000-0000-000000000002', 'tenant-a', 'beta', 5, 'inactive', '2024-01-02T00:00:00Z'),
  ('10000000-0000-0000-0000-000000000003', 'tenant-a', 'gamma', 20, 'active', '2024-01-03T00:00:00Z'),
  ('20000000-0000-0000-0000-000000000001', 'tenant-b', 'delta', 1, 'active', '2024-01-04T00:00:00Z'),
  ('20000000-0000-0000-0000-000000000002', 'tenant-b', 'epsilon', 99, 'inactive', '2024-01-05T00:00:00Z');

INSERT INTO report_configs (report_name, description, stored_text) VALUES
  ('summary', 'id and name', 'id, name'),
  ('detailed', 'id, name, price, status', 'id, name, price, status'),
  ('untrusted', 'not executable', 'name; DROP TABLE items; --');
