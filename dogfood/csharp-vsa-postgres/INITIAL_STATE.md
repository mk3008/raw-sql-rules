# Initial state

Human-prepared before the candidate implementation:

- ASP.NET Core empty Web API scaffold, feature-oriented VSA instructions, and Npgsql.
- Canonical PostgreSQL DDL and minimal seed data.
- Disposable PostgreSQL compose environment and connection information.
- `AGENTS.md` pointing to vendored `rules/raw-sql-rules.md`.

Intentionally absent:

- application DML SQL assets;
- a SQL loader beyond what a candidate might add;
- repository/service/data-access abstraction;
- database test helper or integration-test wrapper;
- application database regression tests.

The repository did not contain an installer. The documented README adoption path (vendor Rules and reference them from AGENTS.md) was used instead; installer-specific discovery cannot be observed in this dogfood.

## Frozen Rules installation

Source commit: `2353a6637d1b696049324ece723c9011f621b7e7`.

Rules SHA-256: `A0E1F71BFBF4CE664F581757284A08B8C9EB6EB28AE9E953CC38965189AB7375`.

Installed path: `examples/csharp-vsa-postgres/rules/raw-sql-rules.md`.

Installed `AGENTS.md`:

```md
# Work Items application guidance

- Use feature-oriented Vertical Slice Architecture.
- Keep each feature's endpoint, application behavior, and data access together.
- Do not introduce global repository or service layers without a concrete need.
- The application uses PostgreSQL through the native Npgsql driver; do not add an ORM, Dapper, a query builder, or a generated query layer.
- Read and follow [rules/raw-sql-rules.md](rules/raw-sql-rules.md) for application database work.
```
