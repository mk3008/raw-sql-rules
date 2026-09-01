# C# VSA PostgreSQL dogfood preregistration

Created: 2026-09-01T00:00:00+09:00

## Primary questions

| ID | Question |
| --- | --- |
| Q1 | Can a fresh implementation agent discover the installed Rules through application repository context alone? |
| Q2 | Do the Rules work without intruding on C# / ASP.NET Core / PostgreSQL Vertical Slice Architecture? |
| Q3 | Can the native PostgreSQL driver be used without an ORM, query builder, repository abstraction, generated query layer, or SQL framework? |
| Q4 | From a bootstrap state with no DB regression path, does the agent establish the smallest reusable real-database path required by Rule 8? |
| Q5 | Do maintenance changes reuse SQL assets, DDL, and DB regression patterns? |
| Q6 | Does bounded sorting avoid fragment builders and use fixed SQL plus bound values or complete reviewed assets? |
| Q7 | Is the application kept as VSA? |

## Secondary questions

| ID | Question |
| --- | --- |
| Q8 | Do independent review rules identify high-value, human-checkable findings rather than style noise? |
| Q9 | Do SQL-source-clarity rules give useful criteria for SQL assets read independently? |

## Evaluation

Each question is classified `meets`, `partial`, `misses`, or `not exercised`. Overall is `MEETS`, `MEETS-WITH-LIMIT`, or `NOT-YET`.

The candidate implementation agent must not receive this file, evaluation criteria, beta review rules, or source-clarity rules. The initial schema is frozen before implementation. Amendments are additive; this document is immutable.
