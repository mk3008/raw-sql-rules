# Probe 2 — node-postgres positional driver

## Scope

This disposable TypeScript probe reused only the pinned node-postgres dependency family from `benchmark/rawsql-harness-sensitivity-ts-v0.6/`; it did not use the benchmark runner. A unique PostgreSQL 16 Compose project created a directly inspectable `work_items` schema preserved at `evidence/positional/schema.sql`.

`ListWorkItems.sql.ts` contains one ordinary SQL statement. Its `parameters` CTE binds `$1::uuid`, `$2::text`, and `$3::int` once, giving them reviewer-visible names `tenant_id`, `status`, and `page_size`. The statement then uses `parameters.status` twice in the filter and uses the cast-bearing values through normal PostgreSQL SQL. The exact review surface is preserved at `evidence/positional/ListWorkItems.sql.ts`.

The TypeScript binding is a feature-specific seven-line function returning `[tenantId, status ?? null, pageSize]`. It validates missing `tenantId` and invalid page size before driver execution. It is not shared, generic, parser-based, generated, or a query abstraction. It introduces no mirror SQL source and no third-party template dependency. Its exact source is preserved at `evidence/positional/probe.ts`.

## Review-surface result

Before looking at binding code, the source is directly recognizable ordinary SQL. A reviewer sees what each positional value means at its one typed CTE binding and can review every later use by semantic alias without reconstructing transformed SQL. The file is a dedicated, single authoritative source. The binding code separately shows the positional array and missing-value behavior.

## Execution evidence

`npm test --silent` compiled the TypeScript and executed the statement through `pg` against the disposable PostgreSQL instance. It printed `POSITIONAL_PROBE_PASS` after proving:

- tenant `11111111-1111-1111-1111-111111111111` with `status: 'open'` returns only the expected row;
- null status returns the bounded expected first page;
- a missing `tenantId` is rejected before execution;
- PostgreSQL casts `$1::uuid`, `$2::text`, and `$3::int` were parsed and executed by the real server/driver.

Runtime/user data remains in the `values` array; it does not become SQL structure. No ORM, builder, generator, parser, or framework-like helper is present.

## Descriptive implementation cost

- SQL-only meaning surface: one 14-line dedicated `.sql.ts` file.
- Feature-local binding API: one function, seven executable lines.
- Generic lowering/API surface: none.

## Limit

This establishes feasibility for node-postgres/PostgreSQL and this CTE idiom, not all positional drivers or dialects. The extra CTE is a real readability/cost tradeoff and should remain visible in a normative draft review.
