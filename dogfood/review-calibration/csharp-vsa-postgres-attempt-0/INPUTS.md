# Frozen inputs

All reviewers receive the same four inputs, and no specialized review
checklist:

1. candidate snapshot exported from
   `30dca66ec9aa4014cc4e7d092f5e2d6c474d6e9f`;
2. the feature requirements below;
3. canonical DDL in the candidate at
   `database/schema/001_work_items.sql`;
4. installed Raw SQL Rules in the candidate at `rules/raw-sql-rules.md`.

The candidate's naturally present `AGENTS.md` is part of the snapshot context.
No current-main content, Git history, review evidence, later candidate, repair,
or scoring answer key is supplied.

## Feature requirements

```text
Implement the initial Work Items API in the existing application.

Requirements:

1. Add a `GET /work-items` endpoint.

It must support these optional request inputs:

- `ownerId`
- `status`
- `createdFrom`
- `createdTo`

It must also support a finite sort mode with these values:

- `created_desc`
- `created_asc`
- `priority_desc`

Reject or safely default unknown sort modes.

Support a bounded page size. Do not change the database schema merely to
simplify the implementation.

2. Add a `POST /work-items/{id}/complete` endpoint.

Completing a work item must:

- mark it as successful;
- set its completion timestamp;
- write the corresponding work-item event;
- perform those database changes atomically.

Return an appropriate not-found response when the work item does not exist.

3. Keep the existing Vertical Slice Architecture.

Implement the feature completely using the existing project and repository
instructions.

Do not add unrelated infrastructure.
```
