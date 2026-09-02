# Raw SQL harness sensitivity study v0.3 — final report

## Result

Study decision: `SENSITIVITY-DEMONSTRATED`.

The study was operationally valid: canonical inputs were hash-verified, CAL01–CAL10 passed fresh, three fresh qualifications passed, dispatch qualification passed, four and only four official Terra/medium turns started, and all primary evaluator and blind Sol evidence was frozen.

| Run | Mechanical Primary | Adversarial Adjudicated Quality |
| --- | --- | --- |
| S01 Control | FAIL — published health failed (`pg` ESM named import) | FAIL |
| S01 Treatment | PASS | PASS |
| S02 Control | FAIL — published health failed (`pg` ESM named import) | FAIL |
| S02 Treatment | FAIL — published health failed (`pg` ESM named import) | FAIL |

The S02 Treatment Sol review additionally produced one mechanically confirmed production-artifact defect: normal `npm start` served the unmodified `dist` application and returned 404 for the requested endpoint. Mechanical Primary rebuilt first, so `EVALUATOR_COVERAGE_GAP = yes`.

## Process comparison

All three failing candidates used `import { Pool } from 'pg'`, which compiled but failed at Node ESM runtime. Treatment S01 used a compatible import path and passed. S02 Treatment created a reusable SQL-asset implementation and transaction logic but did not build its publish artifact before stopping. Control/Treatment both inspected DDL and attempted verification; Docker access was denied to candidates by the sandbox identity, so no candidate completed real-DB verification.

Treatment changed implementation approach and produced one final-quality success, while the matched four-run sample is too small to estimate an effect. The exposed runtime/publish boundary failures and process differences establish sufficient task sensitivity to justify a matched repetition, but no repetition was started.

## Frozen evidence

- Start SHA: `5d40e0d4ba64e3bfb9c073da295385906aba4785`
- Preregistration/freeze SHA: `e00f886`
- Branch: `codex/benchmark-rawsql-harness-sensitivity-ts-v0-3`
- Official launches: 4, frozen order: S01 Control, S02 Treatment, S02 Control, S01 Treatment.
- Sol review event SHA-256: R-A `5f4b47663a07bce79580fedd695c55fe68cb12b5e3bfac9a5c5dcc7a57a040a2`; R-B `fee45eed3a9dbd5e2752d3c988c3a0e28dcb8cc791c2a200cc080c73e4f54ba3`; R-C `b9d1546c01d2fd9657dc5e94230745c481eaf9ce4a149e66eabb62b5c9544cb2`; R-D `e49f766f16103f684d52979578d47b7f6d2d54828103a1a6a85b6ac66a9f1d80`.

Stop for human review. Do not start Phase 2 or a repetition.
