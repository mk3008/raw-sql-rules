# Findings and thread provenance

The three initial review findings were supplied externally through PR #14.
They are not evidence of autonomous detection. No human supplied an additional
technical correction after those review inputs.

| ID | Primary thread | Disposition | Action / SHA | Final status |
| --- | --- | --- | --- | --- |
| R1 | [runtime packaging](https://github.com/mk3008/raw-sql-rules/pull/14#discussion_r3901457383) | suspected runtime defect -> confirmed defect | first repair `6574c380d8df879755efee4b90b38a95d06c3c27`; successful second repair `fee2154e3366c1e51c7f0f5462f8e11c26df9bf4` | resolved |
| R2 | [page-size evidence](https://github.com/mk3008/raw-sql-rules/pull/14#discussion_r3901457408) | resolvable evidence gap | verification strengthening only `2c548691bd32372d481056b768c47aa0cc575b22` | resolved |
| R3 | [repeat semantics](https://github.com/mk3008/raw-sql-rules/pull/14#discussion_r3901457420) | uncertainty / requirement ambiguity | none | resolved as accepted limit |

## R1 — runtime packaging

Adjudication required publish/runtime evidence before repair. The published
artifact initially lacked SQL assets and a representative SQL-backed endpoint
failed. The first minimal repair, `6574c38…`, used `Content Update` and did not
place assets in publish output; verification detected that it was insufficient.
Without additional human instruction, recovery continued with the smallest
follow-up change, `fee2154…`, using `Content Include`. Final publish/runtime
verification found five SQL assets and returned HTTP 200. Human intervention
after the supplied review input: none.

## R2 — page-size evidence

The finding was an evidence gap, not a request to alter endpoint behavior.
Commit `2c54869…` added a database-backed regression for `pageSize=101` that
asserts the existing response clamps to 100. It changed test evidence only;
product behavior was not changed. The final suite passed 6/6.

## R3 — repeat/idempotency semantics

Requirements, canonical DDL, and Raw SQL Rules did not determine repeat or
idempotency semantics. No code changed and no human escalation was needed for
this replay: the ambiguity was retained as an accepted limit. The AI did not
invent product semantics.
