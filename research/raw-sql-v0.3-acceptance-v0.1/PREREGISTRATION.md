# v0.3 distribution-text acceptance — preregistration

## Purpose and boundary

This is a four-case release acceptance of the exact v0.3 distribution text,
not a Control/Treatment comparison and not a claim about a Safety Contract
effect. Each candidate receives the complete frozen `raw-sql-rules.md` through
the normal root `AGENTS.md` reference. No summary packet, evaluator, reference
implementation, or other candidate result is candidate-visible.

## Freeze

- Baseline main: `7d211f53dc67b40c49042fbb671304880bad0319`.
- Distribution source: `raw-sql-rules.md`.
- SHA-256: `153e96afc88201fcd3ec2d7e9649c54a7cd066e400f78905efe675d4f708de5b`.
- Candidate profile: `gpt-5.6-terra`, medium reasoning, the isolated
  `codex.exe` runner-equivalent path recorded with each run.

## Cases and acceptance criteria

| ID | Stack | Change type | Required evidence |
| --- | --- | --- | --- |
| CS-NEW | C# / Npgsql / PostgreSQL | new feature | feature works against PostgreSQL; dedicated SQL source; named SQL and name binding (native or mechanically lowered); current DDL; real DB result |
| CS-MAINT | C# / Npgsql / PostgreSQL | maintenance change | same criteria after changing an existing feature |
| NODE-NEW | Node.js / node-postgres / PostgreSQL | new feature | feature works against PostgreSQL; dedicated named-parameter SQL source and mechanically derived driver values; current DDL; real DB result |
| NODE-MAINT | Node.js / node-postgres / PostgreSQL | maintenance change | same criteria after changing an existing feature |

Before launch, `CASES.md` freezes each task, fixture identity, command oracle,
and expected result. For every case, record separately: requested functional
result, Safety Contract conformance, Defaults 1–4, existence of a D4 path,
actual target DB/driver execution, environment failures, and source/command
evidence. The required evidence fields are: D1 source-file path and statement;
D2 named definitions, named caller binding, and any mechanical lowering
derivation; D3 current DDL path/hash; and D4 path, execution command, and
result.

Safety Contract acceptance requires source inspection showing that runtime
values are bound rather than concatenated into SQL syntax, plus an
injection-shaped runtime value whose observed result does not alter SQL
structure. D2 checks both the SQL source and caller binding. It rejects
comments, CTE aliases, or manual positional arrays as named binding. Both stack
families cover parameter addition, removal, order changes, repeated names,
cast/comment/string distinction, bound hostile values, and missing-name
failure; a native-named driver may demonstrate the same cases without a
lowering step.

The first outcome is preserved. A repair may address only its recorded cause;
its evidence is separate. The distribution text must not change after this
freeze. No unlimited replacement or rerun is authorized.
