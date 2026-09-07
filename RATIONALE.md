# Why Raw SQL Rules exists

Raw SQL Rules is a small development boundary for application paths that have
selected Raw SQL. It is not a framework, a query builder, or a tutorial for
every implementation, review, and testing step. SQL, the selected driver, and
the application remain the technical authorities.

## Scope, Safety Contract, and Requirements

The **Safety Contract** defines the non-customizable core of Raw SQL Rules:
runtime input must not supply arbitrary SQL syntax. Scope states the selected
Raw SQL representation and keeps application concerns application-owned. This
reorganization is an editorial product decision, not evidence of a measured
safety improvement.

The four **Requirements** are supplied as project defaults before adoption. A
project may customize or omit them before adopting its copy of the Rules. In an
adopted Rules file, they are simply requirements to satisfy.

## Why operational/HOW guidance was removed

Earlier No-Rules-vs-Full-Rules work compared the same task prompt with no Raw
SQL guidance against the same prompt with the released Rules and AGENTS
guidance. In the evaluated tasks it found no practical Primary-quality
separation. Controls did not receive equivalent review or real-database
instructions in the shared prompt; they nevertheless inspected DDL and used the
real PostgreSQL boundary.

That comparison did not isolate every historical sentence, so it could not by
itself establish that each deletion was harmless. The v0.2 subtraction gate
therefore compared identical v0.2 Contracts and Default Requirements plus a
minimal pointer against the same material plus the legacy G1--G5
operational/HOW bundle. It again found
`NO_PRACTICAL_SEPARATION_OBSERVED`: all four final trees passed Primary, both
arms used the real DB boundary, and no Guided-only action repaired a defect that
remained in Reduced.

This supports removing the tested legacy operational/HOW layer as a bundle. It
does not prove that every individual historical sentence has zero isolated
effect. The product does not retain operational instructions merely because
they are sound engineering advice.

## Why Scope and the Safety Contract exist

### Raw SQL representation

Scope selects directly reviewable ordinary SQL, executed through the selected
database driver, for covered paths.

### Application ownership

Connections and pools, transactions, retries, logging, result mapping,
migrations, tests, deployment and execution integration, and business semantics
remain application-owned. Application architecture and framework remain
application choices.

### Runtime-input safety

Runtime input must not become arbitrary SQL syntax. The application retains
control of SQL syntax and structural choices; reviewed,
application-controlled structural variation remains permitted. This is a core
safety boundary rather than an implementation recipe.

## Why the Requirements exist

The Requirements provide useful reviewability, maintenance, schema-context, and
verification boundaries without fixing their implementation:

- One authoritative reviewable definition gives each executable application SQL
  statement clear ownership and a directly traceable source from its execution
  sites without requiring a specific file layout.
- Named definitions and named bindings avoid manually maintaining a position-to-
  value correspondence between SQL and its caller.
- Meaningful parameter names preserve intent at the human review surface.
- A directly inspectable current schema provides present-state context without
  mentally replaying migrations.
- A path through the target database engine and selected driver can establish
  behavior that depends on that DB/driver boundary. An isolated or disposable
  test database is sufficient; production access or production data is not
  required.

These are product and design choices about reviewability, maintenance, schema
context, and verifiability. They are not claims that every project, language,
driver, or DBMS needs the same arrangement. Requirement 4 requires a usable
target-DB-and-driver verification path; it does not assert that every change has
already been run through that path.

### Why Requirement 1 is placement-neutral

Dedicated SQL sources remain useful where file inventory, long SQL, SQL-only
review, or cross-operation reuse matters. They are not necessary to preserve the
property Raw SQL Rules actually needs: one authoritative ordinary-SQL definition
that a reviewer can locate from execution sites. Operation-colocated definitions
can preserve the same ownership and reviewability without an extra source hop.

The bounded assessment in
[the v0.3 Default 1 placement decision](research/default-1-v0.3-decision.md)
therefore relaxes dedicated-file placement without establishing that colocation
is universally better. It did not measure human or AI review quality, general
repository-wide discoverability, or a universal layout ranking.

### Why Requirement 2 requires named definitions and bindings

Requirement 2 lets a reviewer inspect the authoritative SQL and its caller
without manually maintaining a position-to-value correspondence. Named markers
and name-based binding keep parameter addition, removal, order changes, and
repeated use attached to a meaningful identity. Comments next to `$1`, or CTE
aliases over positional values, still leave a manual positional correspondence
at the driver call and therefore do not meet v0.3 Requirement 2.

Some drivers require positional or anonymous binding. A local lowering step is
compatible when it mechanically derives the driver representation and value
array from the authoritative names, without creating a second hand-maintained
mapping. This is not a mandate for a marker syntax, DBMS, library, or package.
Values remain bindings rather than SQL syntax.

## Research progression

Raw SQL Rules originated in broader archived Ashiba research. That work is
historical provenance, not a runtime or package dependency. The current
standalone product decision draws on local evidence in this repository:

- [v0.1 reclassification](research/raw-sql-rules-v0.1-reclassification.md)
  separated durable human/product boundaries from model-dependent operational
  instructions.
- [v0.2 feasibility](research/raw-sql-v0.2-feasibility-v0.1/RESULT.md)
  found the proposed Contracts and Requirements practical in its bounded C# and
  node-postgres/PostgreSQL probes.
- [v0.2 subtraction gate](research/raw-sql-v0.2-subtraction-gate-v0.1/RESULT.md)
  tested the removable legacy operational/HOW bundle on top of identical v0.2
  material.
- [v0.3 Default 1 placement decision](research/default-1-v0.3-decision.md)
  found dedicated placement useful but not necessary for the protected
  authoritative-source property, within its stated evidence limits.
- [The v0.6 harness report](benchmark/rawsql-harness-sensitivity-ts-v0.6/FINAL-REPORT.md)
  is the relevant valid bounded benchmark record; invalid studies remain
  engineering evidence rather than causal product claims.

The v0.3 named-parameter decision also uses Ashiba PR #116 as read-only
technical reference: it demonstrates native named and mechanically lowered
bindings with a real node-postgres/PostgreSQL probe. Its product decision was
not to sponsor or rehome a standalone package. Raw SQL Rules neither revives nor
depends on that package work.

## Limits

The evidence is bounded by small task/model samples and recent comparisons that
are PostgreSQL-heavy. It does not establish universal agent behavior, prove
that each historical sentence is individually ineffective, or prove every
Requirement universally necessary.
