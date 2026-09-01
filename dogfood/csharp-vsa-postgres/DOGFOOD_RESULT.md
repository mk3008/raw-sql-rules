# Dogfood result

## Overall: MEETS-WITH-LIMIT

Observed: C# ASP.NET Core VSA with PostgreSQL and Npgsql reached SQL assets, named parameters, finite SQL selection, and a real DB regression command without ORM/Dapper/query builder/repository layers. Attempt 0 was preserved before repair; two maintenance attempts reused the established pattern.

Q1 is `partial`: the application AGENTS reference successfully made the Rules available, but this repository had no installer to test. Q2-Q7 are `meets` based on current source and 12 passing DB tests. Q8 is `meets-with-limit`: review found high-value initial defects and avoided style noise. Q9 is `meets-with-limit`: clarity review identified caller-owned fixed business constants; the later completed query demonstrates the preferred SQL-owned contract.

Limits: this is one C#/PostgreSQL case, not proof of language or DBMS generality. Rollback-on-insert-failure and repeat-completion semantics remain unproven.
