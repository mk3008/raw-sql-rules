# Initial application state

`DOGFOOD_BASELINE_SHA`: `a27871e9d1f8ead99c764eca6b54ee522744dfa5`

The application was created afresh at `examples/csharp-vsa-postgres` from
the frozen current `main` baseline. It is an ASP.NET Core `net9.0` application
with Npgsql `10.0.3`, a PostgreSQL 18.1 Compose service, and canonical schema
and seed SQL under `database/schema` and `database/seed`.

Before installation, its root `AGENTS.md` contained only the human-provided
VSA guidance below. It did not prohibit an ORM, Dapper, query builders,
generated query layers, or state SQL/test requirements.

```md
# Work Items application guidance

- Use feature-oriented vertical slices.
- Keep feature-specific endpoint, application behavior, and data-access code together.
- Do not introduce global repository or service layers without a concrete need.
```

The initial program was the ASP.NET Core template endpoint and had no feature
implementation or test project. No prior PR #7/#8 candidate source or
evidence was supplied to the implementation agents.
