CREATE TABLE work_items (
    id uuid PRIMARY KEY,
    title text NOT NULL,
    owner_id uuid NOT NULL,
    status smallint NOT NULL,
    priority smallint NOT NULL,
    created_at timestamptz NOT NULL,
    completed_at timestamptz NULL,
    CONSTRAINT work_items_status_check CHECK (status IN (0, 1, 2, 3))
);

COMMENT ON COLUMN work_items.status IS '0 = pending; 1 = in_progress; 2 = success; 3 = failed';

CREATE TABLE work_item_events (
    id uuid PRIMARY KEY,
    work_item_id uuid NOT NULL REFERENCES work_items(id),
    event_type text NOT NULL,
    occurred_at timestamptz NOT NULL
);
