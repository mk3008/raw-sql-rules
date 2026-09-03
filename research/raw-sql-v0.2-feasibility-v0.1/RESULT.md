# Result — Raw SQL v0.2 Feasibility Study v0.1

## Overall classification

`PROCEED_TO_NORMATIVE_DRAFT`

Both high-risk probes passed at the real PostgreSQL/driver boundary without duplicate SQL source, generated mirrors, a parser, ORM, query builder, code generator, third-party template, or framework-like helper. This authorizes a later human-reviewed normative draft; it does **not** authorize editing `raw-sql-rules.md` now.

## Per-item feasibility

| Candidate item | Classification | Evidence and conclusion |
| --- | --- | --- |
| Contract 1 — Selected query representation | READY | C# Npgsql and node-postgres probes execute directly visible ordinary SQL through native drivers. |
| Contract 2 — Application ownership | READY | C# feature preserves existing VSA, connection, transaction, mapping, and test ownership; positional probe adds no shared layer. |
| Requirement 1 — Dedicated reviewable source file | READY | A single C# `.sql.cs` source held one statement, removed its `.sql` asset/runtime I/O/publish copy, and passed DB regression/build/publish. |
| Requirement 2 — Parameters named by meaning at review surface | READY | Native Npgsql names are natural. node-postgres CTE aliases provide a small, ordinary-SQL review surface with no lowering machinery. |
| Requirement 3 — Current schema directly inspectable | READY | Relevant current DDL is directly present in both C# and positional probe scopes. |
| Requirement 4 — Runtime input does not own SQL syntax | READY | The positional probe binds values only; the SQL statement controls casts, filtering, ordering, and limit structure. |
| Requirement 5 — DB/driver-dependent behavior verifiable at real boundary | READY | Both converted/new statements ran through their native drivers against real PostgreSQL, without imposing a universal harness. |

## Required answers

1. **Dedicated host source practical?** Yes for the tested C# feature: one `.sql.cs` file is discoverable and reviewable.
2. **Does it remove asset/publish/runtime-I/O burden without replacement burden?** Yes for the converted statement: no `.sql` asset was published or loaded; only a small C# wrapper was added.
3. **Is directly visible ordinary SQL clear enough?** Yes in both review surfaces; source was reviewed before binding code and did not require generated-output reconstruction.
4. **Can native-named drivers meet semantic naming naturally?** Yes: retained Npgsql `@owner_id`, `@completed_from`, and `@completed_to` names are direct.
5. **Can positional-only drivers meet it without disproportionate machinery?** Yes in the tested node-postgres/PostgreSQL case: a CTE gives `$1/$2/$3` meaningful aliases, and a seven-line feature-local binder supplies the positional array.
6. **Is inspectable current schema practical without prescribing HOW?** Yes: relevant canonical DDL is directly readable in both scopes.
7. **Is real DB/driver verification implementable without a prescribed test architecture?** Yes: one focused C# regression and one tiny node-postgres program suffice.
8. **Is incremental feature adoption practical?** Yes: the C# change touched one endpoint and one SQL source; no application-wide rewrite occurred.
9. **Which v0.1 rules change?** See `DECISION_MATRIX.md`: 1/3/4/7 KEEP, 5/8 NARROW, 2 SPLIT, 6 and the Decision rule REMOVE.
10. **Overall classification?** `PROCEED_TO_NORMATIVE_DRAFT`.

## Limitations

This is two PostgreSQL stacks, not language/DBMS universality. The study does not choose final normative wording.

## Human product decisions

1. **Host-language SQL source.** A dedicated host-language source file is acceptable as the authoritative SQL source when its executable statement is directly visible as ordinary SQL, it is the one authoritative representation, no generated mirror/projection is required, it is not hidden behind query construction, and it is dedicated enough to locate and review. `.sql.cs` and `.sql.ts` are examples, not required extensions. Runtime `.sql` assets are not prescribed.
2. **Positional-driver handling.** The CTE-alias technique remains valid feasibility evidence only; it is neither normative nor preferred. Raw SQL v0.2 remains implementation-agnostic: parameter meaning must be visible by name at the human SQL review surface. If a driver cannot consume that representation directly, a safe lowering mechanism may be used, but the Rules prescribe neither local code, an existing library, nor PostgreSQL `$n`, anonymous `?`, CTE aliases, or another DBMS-specific technique. Ashiba PR #116 supports this boundary: lowering was technically coherent, but its human product decision was not to sponsor or rehome a standalone package. No dependency is required and no CTE performance claim is made.
3. **Dedicated-source scope.** The one-statement-per-file requirement applies to executable application SQL statements only. It excludes migrations, current/canonical schema sources, driver/control statements, non-application probes or health checks, and non-executable documentation/examples. These are scope boundaries, not loopholes for hiding application query logic: migrations and schema files may contain related DDL statements, while application DML/queries may not be reclassified to avoid reviewability.

The candidate wording itself remains unchanged during the probes. `raw-sql-rules.md`, README, RATIONALE, EVIDENCE, installers, released v0.1 artifacts, and Agent Execution Rule research are outside this study and unchanged.
