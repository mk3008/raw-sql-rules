# Raw SQL harness sensitivity study v0.6

## Status

Preregistration frozen; official candidate count is **0 / 4**.

## Identity correction

`f0569cc4836d16ae01d14c82dffe2e27223266e0` is authoritative. Before any launch the runner verifies Git blob IDs `a0565c4762405d651605ab60c4a2558f48d03e06`, `a332696ad96444980d8ff436816f7c83d8033157`, and `e7594f2ac30ceb48d51717e9f55992862c4994bc` for the shared launcher, profile, and host runner respectively. It then records their fresh checkout SHA-256 values in `runtime-lock.json`; on-disk SHA-256 is not compared to historical evidence hashes.

Historical-only provenance SHA-256 values are retained in `FREEZE-MANIFEST.json`: `8e117cdb…`, `46278fc…`, and `cddb38ef…`. A matching blob with different on-disk SHA-256 is documented as a representation/hash-method discrepancy, not an invalidity.

## Fixed design

Canonical inputs come only from `03cb7b81980cd9ec9ecd14fd3573aa065dd2840f`. S01/S02 and the neutral fixture are byte-identical. Four serial slots, in the frozen randomized order, use Terra/medium/danger-full-access/never. Control receives no Rules material; Treatment receives only the released v0.1.0 installer output. Mechanical Primary records as-left declared production start and clean reconstruction independently. Sol/high blind review follows all four frozen final trees; findings are hypotheses and never trigger reruns.

`Run-Study.ps1` is run once from ordinary signed-in Windows PowerShell. It creates a unique study-owned directory under the configured host runtime root and records failure durably. Preparation-safe verification is `pwsh -NoProfile -File .\benchmark\rawsql-harness-sensitivity-ts-v0.6\Run-Study.ps1 -PreflightOnly`. The later human-only official invocation is explicit: `pwsh -NoProfile -File .\benchmark\rawsql-harness-sensitivity-ts-v0.6\Run-Study.ps1 -ExecuteOfficial`.

## v0.6 methodological amendment

v0.5 closed `MEASUREMENT-INVALID`: three candidates completed, but the runner misclassified the complete S02-Control evaluator result `primary = FAIL` as evaluator infrastructure failure. For v0.6 only, an existing, parseable `mechanical-primary.json` whose `primary` is `PASS` or `FAIL` means evaluator execution completed. A missing, malformed, or other-value output remains `EVALUATOR_EXECUTION_FAILURE`. Experimental content is otherwise unchanged.

## Secondary-phase recovery

For the preserved v0.6 run only, `PRIMARY_MEASUREMENT_COMPLETE = yes` and `BLIND_REVIEW_COMPLETE = no`. Each blind-review packet is initialized as a neutral one-commit/no-remote Git repository before the Sol turn. The bounded resume mode verifies the four frozen source manifests, four existing mechanical-primary outputs, and official count 4/4; it never invokes Terra candidates or mechanical evaluators, preserves the frozen R01--R04 mapping, and checkpoints completed reviews.
