# Work Items application guidance

- Use feature-oriented Vertical Slice Architecture.
- Keep each feature's endpoint, application behavior, and data access together.
- Do not introduce global repository or service layers without a concrete need.
- The application uses PostgreSQL through the native Npgsql driver; do not add an ORM, Dapper, a query builder, or a generated query layer.
- Read and follow [rules/raw-sql-rules.md](rules/raw-sql-rules.md) for application database work.
