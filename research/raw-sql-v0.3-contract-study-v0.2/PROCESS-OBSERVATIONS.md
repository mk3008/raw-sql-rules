# Per-run process observations (post-hoc descriptive analysis)

## Method and limits

This table reads only the preserved candidate `events.jsonl` streams and
`final-source` snapshots.  The extraction index is
`process-observations.json`; it lists the event IDs mechanically, excluding
evaluator work.  `implemented` means a retained candidate `file_change` and
the final snapshot, not a reconstruction of every edit.  `repair` is
`OBSERVED` only when the record contains a later source change after a
retained failure; a changed invocation, port, or environment is not SQL
safety self-repair.  `verification` is a candidate command and its retained
result; it is not evaluator verification.  `UNKNOWN` is intentional when the
event history cannot establish the point.

| Run | Implemented final state | Self-repair | Candidate verification attempt/result | Environment recovery | Evidence (event IDs; final snapshot) |
| --- | --- | --- | --- | --- | --- |
| A-control-1-replacement-1 | OBSERVED | UNKNOWN | OBSERVED: HTTP attempts 12–13; result mixed/command-error | UNKNOWN | file changes 6,8; failed DB start 10; `final-source` |
| A-control-2 | OBSERVED | UNKNOWN | OBSERVED: HTTP 12 | UNKNOWN | changes 7,8; failed 9,11; `final-source` |
| A-treatment-1 | OBSERVED | UNKNOWN | UNKNOWN: no retained successful target result | UNKNOWN | changes 7,9,12,13; failed 6,10; `final-source` |
| A-treatment-2 | OBSERVED | UNKNOWN | OBSERVED: HTTP 18,23 | OBSERVED: alternate DB/port sequence 20–23 | change 8; failed 12,17,22; `final-source` |
| B-control-1 | OBSERVED | UNKNOWN | UNKNOWN: launch/DB attempts failed | UNKNOWN | change 6; failed 11,14; `final-source` |
| B-control-2 | OBSERVED | UNKNOWN | OBSERVED: HTTP 13 | OBSERVED: alternate DB setup 11–12 | change 6; failed 9,12; `final-source` |
| B-treatment-1 | OBSERVED | UNKNOWN | OBSERVED: HTTP 11 | UNKNOWN | change 7; failed 9,10; `final-source` |
| B-treatment-2 | OBSERVED | UNKNOWN | OBSERVED: `pg_isready` 14 and HTTP 16 | OBSERVED: readiness retry after failed 13 | change 7; failed 12,13; `final-source` |
| C-control-1 | OBSERVED | UNKNOWN | OBSERVED: HTTP 13 after failed test invocation 11 | UNKNOWN | change 7; failed 9,11; `final-source` |
| C-control-2 | OBSERVED | UNKNOWN | OBSERVED: `pg_isready` 14; HTTP 16,18 | OBSERVED: alternate port/DB sequence 13–18 | change 8; failed 11,19; `final-source` |
| C-treatment-1 | OBSERVED | UNKNOWN | UNKNOWN: target-engine commands 11,13 failed | UNKNOWN | change 7; failed 9,11,13; `final-source` |
| C-treatment-2 | OBSERVED | UNKNOWN | OBSERVED: HTTP 14 (retained 500) | UNKNOWN | change 8; failed 11,13; `final-source` |
| D-control-1 | OBSERVED | UNKNOWN | UNKNOWN: DB command 8 failed | UNKNOWN | change 6; `final-source` |
| D-control-2 | OBSERVED | UNKNOWN | OBSERVED: HTTP 12 | UNKNOWN | change 6; failed 8,11; `final-source` |
| D-treatment-1 | OBSERVED | OBSERVED change after failure, cause UNKNOWN | UNKNOWN: DB starts 8,10 failed | UNKNOWN | changes 6,15; failed 8,10; `final-source` |
| D-treatment-2 | OBSERVED | UNKNOWN | UNKNOWN: no retained target result | UNKNOWN | change 6; `final-source` |
| E-control-1 | OBSERVED | UNKNOWN | UNKNOWN: DB/HTTP attempts 9,10 failed | UNKNOWN | change 6; `final-source` |
| E-control-2 | OBSERVED | UNKNOWN | OBSERVED: HTTP 10 | UNKNOWN | change 6; failed 9; `final-source` |
| E-treatment-1 | OBSERVED | UNKNOWN | OBSERVED: HTTP 16 after failed test 15 | UNKNOWN | changes 6,7; failed 9,12,15; `final-source` |
| E-treatment-2 | OBSERVED | UNKNOWN | OBSERVED: HTTP 14, including DB-backed 200 results | OBSERVED: port collision 9; alternate port DB start 12 | change 6; failed 9,10,13; `final-source` |

`E-treatment-2` is the clearest bounded example: item 9 records host port
55432 already allocated; item 12 tears down and starts PostgreSQL on 55433;
item 14 records candidate HTTP results, including 200 responses.  This is
environment recovery and a DB-connected verification attempt/result.  It is
not, without a later source change and a safety-specific failed check, evidence
of SQL-safety self-repair.

## Q7 interpretation

The observed process evidence answers Q7 narrowly: candidates sometimes
attempted syntax, HTTP, or DB checks and sometimes recovered environment
conditions, but the retained streams are incomplete for initial state and
causal reasoning.  There is no supported arm-level inference about
self-repair, verification propensity, or a Contract effect.  In particular,
the evaluator's Docker/HTTP work is excluded from this table, and the frozen
variant-derived `safeFromFirstImplementation`/`unsafeFinalResult` values are
not candidate process observations.
