# v0.3 distribution-text acceptance results

## Method and boundary

Each candidate used a new Git repository outside this repository, with the
complete frozen Rules file available solely through root `AGENTS.md`. All
launches used `gpt-5.6-terra`, medium reasoning, and
`C:\Users\mssgm\AppData\Local\OpenAI\Codex\bin\2d468d2a6f48dd72\codex.exe`
(0.153.3). This is a release acceptance, not a Control/Treatment study.

| Case | Function | Safety Contract | D1 | D2 | D3 | D4 |
| --- | --- | --- | --- | --- | --- | --- |
| CS-NEW | PASS | PASS | PASS | PASS (native Npgsql names) | PASS | PASS |
| CS-MAINT | PASS | PASS | PASS | PASS (native Npgsql names) | PASS | PASS |
| NODE-NEW | PASS after two cause-specific repairs | PASS | PASS | PASS after lexical repair | PASS | PASS |
| NODE-MAINT | PASS | PASS | PASS | PASS after lexical repair | PASS | PASS |

`CS-NEW-r1` records five new PostgreSQL/Npgsql tests passing. Its pre-existing
full-suite failure is separately preserved: Windows Event Log write permission
blocked an unrelated rollback test (25 passed, 1 environment error). The
changed feature was not implicated. `CS-MAINT-r1` initially left Npgsql tests
unexecuted, but the independent follow-up run of its full test project restored
and passed all 24 tests against PostgreSQL.

For C# the current DDL file is
`examples/csharp-vsa-postgres/database/schema/001_work_items.sql`
(`b30342a80606a9abac8abb70e33e2fdd2a68e2a246c322c17ed4ac6c6fb7d64b`).
Node evidence retains its fixture `database/init.sql` together with each final
source snapshot.

## Preserved first outcomes and repairs

`NODE-NEW-r1` initially returned an object envelope where the frozen task
required an array. `NODE-NEW-r1-repair-1` corrected only that response shape.
Its subsequent lexical check found that regex lowering treated names in SQL
comments and strings as bindings; `NODE-NEW-r1-repair-2` corrected that defect
and added a reproducible PostgreSQL/node-postgres check. `NODE-MAINT-r1`
likewise initially used regex lowering; `NODE-MAINT-r1-repair-1` added lexical
handling and verification. Initial outputs and every repair are retained in
separate evidence directories.

The Node verifiers cover named parameter addition, removal, reordering,
repeated names, casts, strings, line/block comments, hostile bound values, and
missing binding rejection. They do not turn the result into evidence that every
possible SQL dialect lexical edge case is covered.

## Release implication

The four planned configurations passed the stated acceptance conditions after
the recorded, bounded repairs. This is evidence that the exact v0.3 text can
be followed in these fixtures; it does not establish a general safety-effect
claim, a universal SQL parser guarantee, or a reason to change the Safety
Contract.
