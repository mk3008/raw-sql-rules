# Frozen acceptance cases

All cases begin in a new Git repository outside this research repository. The
runner copies only the named fixture, writes the exact frozen Rules file to
`rules/raw-sql-rules.md`, and writes a root `AGENTS.md` that points to it.

| ID | Fixture | Task | Functional oracle |
| --- | --- | --- | --- |
| CS-NEW | `examples/csharp-vsa-postgres` | Add `GET /work-items/owner-summary?ownerId=<uuid>&from=<ISO-8601>` returning the caller owner's count grouped by status since `from`; reject malformed inputs with 400. | A known seeded owner returns its expected grouped counts; another owner does not receive its rows; malformed UUID and injection-shaped input return 400. |
| CS-MAINT | `examples/csharp-vsa-postgres` | Maintain `GET /work-items/completed` by adding an optional `completedTo` upper bound while preserving its existing behavior when absent. | Existing no-upper-bound response is unchanged; a bounded request excludes later rows; malformed/duplicate bounds return 400; tenant/owner isolation is preserved. |
| NODE-NEW | `research/raw-sql-v0.3-contract-study-v0.2/fixture` | Add `GET /acceptance/items?tenantId=<tenant>&status=<optional>&limit=<optional>` for the fixture `items` table, ordered by `created_at`; reject unsupported, duplicate, and injection-shaped inputs. | tenant-a active limit 2 is alpha then gamma; omitted status returns only that tenant; tenant-b cannot receive tenant-a rows; invalid inputs return 4xx. |
| NODE-MAINT | `research/raw-sql-v0.3-contract-study-v0.2/evidence/official-runs/E-treatment-2/final-source` | Maintain `/scenario-e/items` by adding an optional `minPrice` filter while preserving existing status/limit behavior, and migrate the statement to v0.3 D2. | Existing active limit 2 response is unchanged; `minPrice=10` filters correctly; duplicate/invalid/injection-shaped minPrice returns 4xx; tenant isolation remains. |

The exact seeded UUIDs, timestamps, and expected JSON are read from the frozen
fixture DDL/seed by the independent evaluator before each run and recorded in
that run's `fixture-manifest.json`. The evaluator must not be shown to a
candidate.

For each case, the evaluator verifies source and behavior as follows:

- Function: the listed valid and invalid HTTP cases against PostgreSQL.
- Safety Contract: hostile runtime values remain bound and cannot change the
  fixed SQL structure; only reviewed finite structure may vary.
- D1: every new/changed executable application statement is in one dedicated,
  directly readable authoritative source file, not a generated mirror.
- D2: authoritative SQL has meaningful named definitions; caller binding uses
  those names. Any driver representation is derived mechanically. The test
  covers add/remove/order/repeated name/cast/comment/string parsing, missing
  binding rejection, and hostile bound values.
- D3: the fixture's canonical current DDL path and SHA-256 are recorded.
- D4: the supplied Compose/test path exists, then the candidate's changed path
  is actually exercised through its selected PostgreSQL driver.
