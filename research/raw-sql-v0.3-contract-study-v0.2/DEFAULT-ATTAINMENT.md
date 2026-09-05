# Author Default Requirement attainment (post-hoc descriptive analysis)

## Boundary and method

This is a post-hoc, descriptive reading of the frozen final sources for the
20 Primary-evaluated runs.  It does not change the frozen Primary result,
candidate sources, events, or task instructions.  `MET`, `NOT_MET`, and
`UNKNOWN` below mean conformance of the *final artifact* to the current
author Default Requirements in `raw-sql-rules.md`; they do not mean that a
candidate did or did not follow the packet it received.

The common packet in both arms stated a shortened version of Default 1:
"one dedicated authoritative reviewable source."  It omitted the current
requirement that this be a dedicated **source file**, directly readable as
ordinary SQL, rather than query construction or a generated/mirrored copy.
It also abbreviated the other Defaults.  Therefore the table does not call a
failure against that omitted condition instruction non-compliance.  Earlier
technical feasibility, the prompt summary, and final-artifact conformance are
separate evidence layers.

For every row, `final-source/database/init.sql` is directly inspectable
current fixture schema, and `final-source/compose.yaml`, `package.json`, and
the `pg` use in `final-source/src/server.js` provide a target-engine/driver
verification path.  Every final `src/server.js` contains the executable
application `SELECT` and positional `$n` placeholders.  None supplies a
separate authoritative application-SQL source file, so Default 1 is
`NOT_MET` for all 20.  For Default 2, positional placeholders **alone** are
`NOT_MET`; a directly adjacent SQL comment that identifies every placeholder
by a meaningful name is treated as a human-review-surface name and is `MET`.
That conservative, stated interpretation produces 10 `MET` and 10 `NOT_MET`
rows below. Default 3 and the *path* part of Default 4 are `MET` for all 20.
Default 4 does not require a candidate to have run that path, so the final
column records that observation separately.

Event IDs refer to the preserved per-run `events.jsonl`; `final-source/*`
refers to that run's immutable final snapshot.  An HTTP/DB command is only
counted when it is in the candidate event stream, never when the evaluator
ran it.

| Run | D1 | D2 | D3 | D4 path | Candidate executed DB/driver path | Evidence |
| --- | --- | --- | --- | --- | --- | --- |
| A-control-1-replacement-1 | NOT_MET | NOT_MET | MET | MET | OBSERVED | `final-source/src/server.js`; `database/init.sql`; `compose.yaml`; HTTP/DB items 10–13 |
| A-control-2 | NOT_MET | NOT_MET | MET | MET | OBSERVED | final source paths above; HTTP item 12 |
| A-treatment-1 | NOT_MET | MET | MET | MET | UNKNOWN | `src/server.js` comments each `$1` as `tenantId`; no retained successful target-engine result |
| A-treatment-2 | NOT_MET | NOT_MET | MET | MET | OBSERVED | final source paths above; alternate DB/HTTP items 20–23 |
| B-control-1 | NOT_MET | MET | MET | MET | UNKNOWN | `src/server.js` names `$1`/`$2` as tenantId/status; launch/DB attempts 11,14 failed |
| B-control-2 | NOT_MET | NOT_MET | MET | MET | OBSERVED | final source paths above; alternate DB and HTTP items 11–13 |
| B-treatment-1 | NOT_MET | MET | MET | MET | UNKNOWN | `src/server.js` authoritative-SQL comment names `$1`/`$2`; launch item 10 failed |
| B-treatment-2 | NOT_MET | NOT_MET | MET | MET | OBSERVED | final source paths above; `pg_isready` item 14 and HTTP item 16 |
| C-control-1 | NOT_MET | NOT_MET | MET | MET | OBSERVED | final source paths above; HTTP item 13 |
| C-control-2 | NOT_MET | MET | MET | MET | OBSERVED | `src/server.js` comments name tenantId/status; `pg_isready` item 14 and HTTP items 16,18 |
| C-treatment-1 | NOT_MET | MET | MET | MET | UNKNOWN | `src/server.js` comments name tenantId/status; target-engine commands 11,13 failed |
| C-treatment-2 | NOT_MET | MET | MET | MET | OBSERVED | `src/server.js` comments name tenantId/status; HTTP item 14 (HTTP 500 is retained as an observation) |
| D-control-1 | NOT_MET | MET | MET | MET | UNKNOWN | `src/server.js` comment names `$1` tenantId; DB command item 8 failed |
| D-control-2 | NOT_MET | NOT_MET | MET | MET | OBSERVED | final source paths above; HTTP item 12 |
| D-treatment-1 | NOT_MET | NOT_MET | MET | MET | UNKNOWN | final source paths above; DB commands 8,10 failed |
| D-treatment-2 | NOT_MET | MET | MET | MET | UNKNOWN | `src/server.js` comment names `$1` tenantId; no retained target-engine result |
| E-control-1 | NOT_MET | NOT_MET | MET | MET | UNKNOWN | final source paths above; DB/HTTP attempts 9,10 failed |
| E-control-2 | NOT_MET | NOT_MET | MET | MET | OBSERVED | final source paths above; HTTP item 10 |
| E-treatment-1 | NOT_MET | MET | MET | MET | OBSERVED | `src/server.js` comment names `$1`/`$2`/`$3`; HTTP item 16 after failed item 15 |
| E-treatment-2 | NOT_MET | MET | MET | MET | OBSERVED | `src/server.js` comment names `$1`/`$2`/`$3`; alternate DB recovery item 12 and HTTP item 14 |

The named examples in the review are included in the universal finding:
`A-control-1-replacement-1/final-source/src/server.js` and
`D-control-1/final-source/src/server.js` retain application SQL in the
ordinary server file and are therefore not Default-1 attainment examples.

## Implication for the v0.3 proposal

The prior feasibility work may support that dedicated SQL files and
meaningful human-surface parameter names are technically possible.  The
common packet shows only that an abbreviated summary was supplied here.  This
table instead shows that the 20 preserved final artifacts do **not** establish
Default 1 attainment and show mixed Default 2 attainment under the stated
comment-at-review-surface interpretation. A proposal to KEEP those Defaults is
therefore a product/feasibility judgment, not an effect inferred from these
20 candidates. Defaults 3–4 have descriptive artifact support only; Default
4's verification-path requirement must not be misreported as proof that every
candidate performed verification.
