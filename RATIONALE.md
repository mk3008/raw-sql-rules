# Why Raw SQL Rules exists

Raw SQL Rules is a small development boundary for application paths that have
selected Raw SQL. It is not a framework, a query builder, or a tutorial for
every implementation, review, and testing step. SQL, the selected driver, and
the application remain the technical authorities.

## Contracts and Default Requirements

The three **Contracts** define the identity of Raw SQL Rules. They are durable
human/product boundaries and are not customizable while a project calls its
configuration Raw SQL Rules:

1. Raw SQL is the selected query representation.
2. Application concerns remain application-owned.
3. Runtime input does not supply arbitrary SQL syntax.

The four **Default Requirements** are supplied project defaults for source and
parameter reviewability, schema context, and real-boundary verifiability. A
project may customize or omit them without changing the Contracts. They are not
weak suggestions, but neither are they experimentally established universal
necessities.

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

## Why the Contracts exist

### Raw SQL representation

The first Contract selects directly reviewable ordinary SQL, executed through
the selected database driver, for covered paths. It does not require a runtime
`.sql` asset or claim superiority over other data-access approaches.

### Application ownership

Connections, transactions, retries, mapping, migrations, tests, deployment,
and business semantics remain application-owned. This prevents Raw SQL Rules
from becoming an application framework or prescribing an application's
architecture.

### Runtime-input safety

Runtime input must not become arbitrary SQL syntax. The application retains
control of SQL syntax and structural choices; reviewed,
application-controlled structural variation remains permitted. This is a core
safety boundary rather than an implementation recipe.

## Why the Default Requirements exist

The Default Requirements supply useful project defaults without fixing their
implementation:

- A dedicated reviewable source makes executable application SQL discoverable.
- Meaningful parameter names preserve intent at the human review surface.
- A directly inspectable current schema provides present-state context without
  mentally replaying migrations.
- A path through the target database engine and selected driver can establish
  behavior that depends on that real boundary.

These are human product and design choices about reviewability, maintenance,
schema context, and verifiability. They are not claims that every project,
language, driver, or DBMS needs the same arrangement.

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
- [The v0.6 harness report](benchmark/rawsql-harness-sensitivity-ts-v0.6/FINAL-REPORT.md)
  is the relevant valid bounded benchmark record; invalid studies remain
  engineering evidence rather than causal product claims.

External Ashiba material remains useful for historical origin and is not a
claim that the current product is an Ashiba subsystem.

## Limits

The evidence is bounded by small task/model samples and recent comparisons that
are PostgreSQL-heavy. It does not establish universal agent behavior, prove
that each historical sentence is individually ineffective, prove every Default
Requirement universally necessary, or claim that Raw SQL universally beats ORM
or query-builder approaches.
