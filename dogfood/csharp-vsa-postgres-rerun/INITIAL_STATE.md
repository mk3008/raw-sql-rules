# Initial state

- `DOGFOOD_BASELINE_SHA`: `fe7bea9dd510e3d19547b3135c5682944b752259`
- Branch: `codex/dogfood-csharp-vsa-postgres-rerun`
- Application: ASP.NET Core `net9.0`, Npgsql 10.0.3, PostgreSQL 18.1 compose, canonical DDL and seed data.

Before installer execution, application `AGENTS.md` contained only:

```md
- Use feature-oriented Vertical Slice Architecture.
- Keep feature-specific endpoint, behavior, and data-access code together.
- Do not introduce global repository or service layers without a concrete need.
```

No human instruction prohibited ORM/Dapper/query builders or required SQL assets/DB-backed tests.
