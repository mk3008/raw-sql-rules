# Raw SQL harness sensitivity study v0.5 — final report

Classification: `MEASUREMENT-INVALID`.

`TASK_SENSITIVITY_OBSERVED = yes`
`HARNESS_EFFECT_ESTIMABLE = no`

The official run consumed three of four candidate slots. Candidate trees, event streams, frozen sources, and evaluator outputs are preserved under `C:\tmp\raw-sql-rules-runner\rawsql-v05-3e423eff862a424f8b2e3ae7136ef332` and must not be repaired or rerun.

| Slot | Mechanical Primary | Status |
| --- | --- | --- |
| S02-Treatment | PASS | completed |
| S01-Control | PASS | completed |
| S02-Control | FAIL | completed; candidate defect preserved |
| S01-Treatment | not launched | not consumed |

S02-Control produced a complete `mechanical-primary.json`. Both normal production start and clean reconstruction failed with `SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string`. This is a candidate measurement result, not an evaluator infrastructure failure.

The orchestration incorrectly classified the evaluator's process exit code `1` for that valid `primary = FAIL` output as `EVALUATOR_EXECUTION_FAILURE_S02-Control`, so the fourth slot and blind-review stage did not run. The resulting incomplete paired measurement means the harness effect is not estimable. v0.6 carries exactly one methodological amendment: a well-formed evaluator output whose `primary` is either `PASS` or `FAIL` is accepted as completed evaluator execution.
