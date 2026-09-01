# Candidate prompt

This is the verbatim initial human instruction supplied to the fresh candidate.

```text
Implement owner reassignment for work items in the existing C# ASP.NET Core application.

Add:

PATCH /work-items/{id}/owner

Request body:

{
  "ownerId": "<uuid>"
}

Required behavior:

1. If the work item does not exist, return 404.

2. If it exists:
   - update `work_items.owner_id` to the supplied ownerId;
   - write one corresponding row to `work_item_events`
     with `event_type = 'owner_changed'`;
   - use the same operation timestamp for the event;
   - perform the update and event insert atomically in one database transaction.

3. Reassigning to the same owner is a successful no-op:
   - return 204;
   - do not update the row;
   - do not write an `owner_changed` event.

4. Reassigning A -> B and later B -> A are two real changes:
   - each successful owner change writes exactly one event.

5. Do not change the database schema.

6. Keep the existing Vertical Slice Architecture.

7. Preserve the existing Raw SQL approach and repository instructions.

8. Add the smallest useful real-PostgreSQL regression coverage for the behavior.

9. The feature must work from a normal published application, not only from the source tree.

Do not add unrelated infrastructure or abstractions.
```
