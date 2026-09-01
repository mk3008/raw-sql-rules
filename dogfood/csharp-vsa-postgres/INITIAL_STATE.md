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
