# Raw SQL harness sensitivity study v0.3 — final report

## Result

Study decision: `MEASUREMENT-INVALID`

`TASK_SENSITIVITY_OBSERVED = yes`

`HARNESS_EFFECT_ESTIMABLE = no`

`EVALUATOR_COVERAGE_GAP = yes`

The frozen evidence remains valid engineering evidence, but this study is not a valid estimate of the comparative effect of the Raw SQL Rules harness.

## Preregistered capability deviation

The frozen protocol required official candidates to have ordinary shell, filesystem, Docker, and network capability. Runner and qualification Docker success did not prove that capability for the official candidate identity.

The official candidates actually ran under a sandbox identity that denied Docker daemon access. Consequently, no candidate could complete candidate-owned real-PostgreSQL verification. This is not merely symmetric environment noise: real database-boundary inspection and execution was a material hypothesized mechanism of the Rules.

Rules → inspect/execute against the real DB boundary → detect runtime/database defects → repair → reverify → converge before completion.

Because the required mechanism was unavailable as preregistered, the study cannot estimate a harness effect. Equal restriction of both arms does not restore construct validity.

## Reference engineering observations only — not a valid treatment-effect comparison

The following Mechanical Primary outputs are unchanged historical records of the frozen artifacts. They must not be read as Control 0/2 versus Treatment 1/2, an effect size, or evidence of Treatment superiority.

| Run | Mechanical Primary | Adversarial Adjudicated Quality |
| --- | --- | --- |
| S01 Control | FAIL — published health failed (`pg` ESM named import) | FAIL |
| S01 Treatment | PASS | PASS |
| S02 Control | FAIL — published health failed (`pg` ESM named import) | FAIL |
| S02 Treatment | FAIL — published health failed (`pg` ESM named import) | FAIL |

The S02 Treatment Sol review additionally produced one mechanically confirmed production-artifact defect: normal `npm start` served the unmodified `dist` application and returned 404 for the requested endpoint. Mechanical Primary rebuilt first, so `EVALUATOR_COVERAGE_GAP = yes`; this finding does not rescue the invalid comparison.

## Process comparison

Three candidates used `import { Pool } from 'pg'`, which compiled but failed at Node ESM runtime. S01 Treatment used a compatible import path and happened to pass the fixed evaluator. This is an observation only: there is no evidence that the Rules caused that implementation choice, prevented the runtime defect, improved autonomous recovery, or improved final quality. Chance implementation variation cannot be excluded. S02 Treatment also contained the same `pg` ESM runtime defect, so the outcomes do not support a Rules-caused protection hypothesis.

The S01/S02 tasks appear capable of exposing realistic runtime and publish defects, and blind Sol adversarial review demonstrated coverage beyond the fixed evaluator. These observations establish task sensitivity, not a product effect. No Phase 2 or repetition was started.

## Future work only

Any clean rerun must first qualify the exact official candidate sandbox identity and permission path, from inside that sandbox, for: `docker version`, Docker daemon access, container creation, PostgreSQL startup, PostgreSQL connection, one real SQL execution, and teardown. Official candidates may begin only after that non-study qualification passes.

## Frozen evidence

- Start SHA: `5d40e0d4ba64e3bfb9c073da295385906aba4785`
- Preregistration/freeze SHA: `e00f886`
- Branch: `codex/benchmark-rawsql-harness-sensitivity-ts-v0-3`
- Official launches: 4, frozen order: S01 Control, S02 Treatment, S02 Control, S01 Treatment.
- Sol review event SHA-256: R-A `5f4b47663a07bce79580fedd695c55fe68cb12b5e3bfac9a5c5dcc7a57a040a2`; R-B `fee45eed3a9dbd5e2752d3c988c3a0e28dcb8cc791c2a200cc080c73e4f54ba3`; R-C `b9d1546c01d2fd9657dc5e94230745c481eaf9ce4a149e66eabb62b5c9544cb2`; R-D `e49f766f16103f684d52979578d47b7f6d2d54828103a1a6a85b6ac66a9f1d80`.

Stop for human review.
