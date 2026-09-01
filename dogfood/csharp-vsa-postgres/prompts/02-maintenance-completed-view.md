Add a `GET /work-items/completed` endpoint.

It returns only successfully completed work items.

It may optionally filter by:

- owner
- completed-from timestamp
- completed-to timestamp

The caller does not choose the completion status.

Preserve the existing architecture and testing patterns.
