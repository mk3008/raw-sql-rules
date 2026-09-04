## Raw SQL

For Raw SQL data-access work, read `rules/raw-sql-rules.md` and follow it as the
repository contract.

Before merge, run a fresh review of Raw SQL data-access changes against the
requirements, canonical DDL, and these Rules.

Bind runtime values with the driver's parameter mechanism. Do not concatenate or
interpolate external input into application SQL, and do not derive identifiers,
predicates, joins, projections, expressions, grouping, or other SQL syntax from
it. Choose an `ORDER BY` form from a finite whitelist of complete clauses, or
choose among complete reviewed SQL sources. For optional filters, prefer one
fixed statement whose values are bound (for example a null guard). When that
cannot express the needed semantics, choose between complete reviewed SQL
sources; do not assemble predicate fragments at runtime.

When the selected driver's application-facing API supports native named
parameters, write the driver's named placeholders in source SQL and bind by
name. For a positional-only driver, deterministic named-to-positional lowering
may be needed; the adapter is application-owned and must not require a
framework.

Exercise representative application SQL through the target database engine and
its native driver. Do not establish a runtime result contract solely from DDL
declarations, static language types, mocks, or type assertions. Follow the
application's existing database-backed regression pattern and keep or extend
relevant regression coverage. If no database-backed regression path exists,
establish the smallest reusable path: apply relevant canonical DDL to the target
database, execute representative application SQL through the native driver,
assert meaningful behavior and relevant runtime result representations, and
provide one repeatable command.

Before introducing a new abstraction, first try: existing SQL source + current
schema + native driver + application test. If this cannot work, state the exact
mechanical fact that requires code; do not silently add a framework or helper.
