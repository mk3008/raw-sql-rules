# Raw SQL v0.2 Feasibility Study v0.1 — Pre-execution Freeze

- Starting `main`: `f5c26c0530e7cf092f8d4a0f24dea08998adf752`.
- Candidate: `CANDIDATE.md` is a verbatim copy of the proposal's two Contracts and five Requirements. Its SHA-256 is recorded below before probes begin.
- The normative `raw-sql-rules.md`, README, RATIONALE, EVIDENCE, installers, and released v0.1 artifacts remain unchanged.

## Frozen probes

1. In a disposable copy of final merged `examples/csharp-vsa-postgres/` source (historical clean dogfood state beginning at `121cf4e`), convert one representative dedicated runtime `.sql` asset to one dedicated host-language source file containing directly visible ordinary SQL. Verify one authoritative representation, no generated mirror, no runtime asset loading for that statement, no new library or generic abstraction, named Npgsql parameters, retained application/VSA and transaction ownership, relevant real-PostgreSQL regression, `dotnet build`, and publish behavior.
2. Reuse the smallest useful node-postgres/PostgreSQL mechanism from `benchmark/rawsql-harness-sensitivity-ts-v0.6/` without the benchmark runner. In a tiny isolated fixture, execute a query with two different semantic values, one repeated value, and PostgreSQL cast syntax. Assess whether the dedicated reviewable SQL source can identify parameter meanings without ORM, builder, generator, third-party templating, parser, mirror source, or framework-like machinery.

## Acceptance rubric

Review source before binding code: ordinary recognizable SQL; no generated-output reconstruction; semantic parameter meaning visible; exactly one authoritative representation; feature-local discoverability. Then assess binding/execution, current-schema inspectability, runtime values not owning syntax, real DB/driver verification, application ownership, and incremental adoption.

Classify every candidate item `READY`, `NARROW`, `BLOCKED`, or `UNTESTED`. The positional review-surface requirement is `READY` only when a positional-driver solution is small and understandable application code; it is `NARROW` when semantic meaning is valuable but current wording forces awkward/nontrivial lowering; it is `BLOCKED` when it requires a material abstraction whose cost defeats the reduction. No composite score is used.

Overall classification is exactly one of `PROCEED_TO_NORMATIVE_DRAFT`, `REVISION_REQUIRED_BEFORE_DRAFT`, `DO_NOT_PROCEED`, or `INSUFFICIENT_EVIDENCE`. `PROCEED_TO_NORMATIVE_DRAFT` requires no BLOCKED item, bounded NARROW items only, no duplicate SQL or framework-like helper, and real DB/driver verification for new probes.

## Existing evidence eligible for reuse

The merged C# dogfood record documents Npgsql/native SQL, named parameters, application-owned transaction/mapping/tests, inspectable DDL, PostgreSQL-backed coverage, and a 14-test final suite. The v0.6 fixture documents a minimal node-postgres dependency and a PostgreSQL Compose schema/seed path. This study does not generically re-prove those facts; it tests the two source-representation/positional-binding risks and incremental adoption.

## Candidate hash

`CANDIDATE.md`: `cd5a535ac376465e80c1da120d01cce960ec3fadc53b9fadaab08852f75e0436`.
