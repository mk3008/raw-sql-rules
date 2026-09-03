# Probe 1 — C# host-language SQL source

## Scope

Historical source was left untouched. A disposable copy of `examples/csharp-vsa-postgres/` was made from the final merged application state represented by `121cf4e`. The representative `GetCompletedWorkItems` feature changed only its `ListCompletedWorkItems` statement:

- Before: dedicated runtime asset `ListCompletedWorkItems.sql`, read through `SqlFileLoader`.
- After: dedicated `ListCompletedWorkItems.sql.cs` containing one C# raw string statement; the handler passes `ListCompletedWorkItemsSql.Text` directly to `NpgsqlCommand`.
- The old `.sql` file was removed. No generated projection or mirror was added.

The full reviewer-visible after source is preserved at `evidence/csharp/ListCompletedWorkItems.sql.cs`.

## Review-surface result

Before inspecting binding code, the statement remains recognizable ordinary SQL: `SELECT`, `FROM`, `WHERE`, `ORDER BY`, native `@owner_id`, `@completed_from`, and `@completed_to` parameters are directly visible. The raw-string wrapper is small, requires no generated output to reconstruct, and the dedicated feature-local filename makes the statement easy to locate. There is one authoritative representation.

Binding code separately retains native Npgsql parameter names, existing feature/VSA layout, connection ownership, and application transaction ownership. No library or generic SQL abstraction was introduced; the feature alone stops using the existing loader.

## Execution evidence

The disposable copy used a uniquely named PostgreSQL Compose project. Results:

- `dotnet test ... --filter FullyQualifiedName~GetCompletedWorkItems_ReturnsOnlySuccessfulCompletedItemsAndFiltersByOwnerAndCompletedRange --no-restore`: `1 passed, 0 failed` against PostgreSQL.
- `dotnet build WorkItems.sln --no-restore`: PASS, `0 warnings`, `0 errors`.
- `dotnet publish src/WorkItems.Api/WorkItems.Api.csproj --no-restore`: PASS.
- Publish output contained `WorkItems.Api.dll` and did **not** contain `Features/WorkItems/GetCompletedWorkItems/ListCompletedWorkItems.sql`.

Therefore this converted statement has no runtime file load and no publish/copy asset burden. The project still has other unchanged `.sql` assets and its loader; this probe makes no claim that they were converted.

## Descriptive implementation cost

- Removed: one 15-line `.sql` asset and one loader call/import from the handler.
- Added: one 22-line dedicated `.sql.cs` file (namespace/class/raw-string wrapper included).
- Added infrastructure/API surface: none.

## Limit

This is one ASP.NET Core / Npgsql / PostgreSQL feature. It does not establish that every host-language embedding style is equally readable.
