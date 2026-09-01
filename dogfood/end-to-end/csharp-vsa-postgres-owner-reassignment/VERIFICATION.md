# Verification

Final application head: `c71d8eb3cb44834010ddb4e70cadbfb1bed29d2c`.

## Current-head results

- `dotnet test examples/csharp-vsa-postgres/WorkItems.sln --no-restore`: 21 passed, 0 failed.
- Targeted rollback regression: 1 passed, 0 failed.
- `dotnet publish` of `WorkItems.Api`: succeeded.
- Source SQL assets: 11; published SQL assets: 11.
- Published application, launched from its publish directory with its PostgreSQL connection setting, returned `204` for `PATCH /work-items/{id}/owner`.
- `git diff --check origin/main...HEAD`: passed for the application PR.

The rollback regression installs a test-only PostgreSQL CHECK constraint that rejects `owner_changed`, sends the endpoint request, observes HTTP 500, then verifies that the owner remains unchanged and no `owner_changed` event exists. This verifies the database transaction boundary without changing product behavior.

## Environment effects

Some isolated reviewer attempts could not read the user NuGet configuration under sandboxing, so those reviewers marked their own runtime proof unavailable. The final current-head verification above ran in the available Windows environment with PostgreSQL 18.1 in Docker and .NET 9.0.300.
