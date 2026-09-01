# Work Items application guidance

- Use feature-oriented vertical slices.
- Keep feature-specific endpoint, application behavior, and data-access code together.
- Do not introduce global repository or service layers without a concrete need.

<!-- raw-sql-rules:start -->
## Raw SQL

Before changing or reviewing a Raw SQL data-access path, read `rules/raw-sql-rules.md`.
Follow it as the repository contract for Raw SQL work.
Before merge, run a fresh review of Raw SQL data-access changes against the requirements, canonical DDL, and these Rules.
<!-- raw-sql-rules:end -->
