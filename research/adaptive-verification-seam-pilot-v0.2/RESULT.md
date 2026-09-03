# Result — Adaptive Verification Seam Pilot v0.2

## Frozen classification

`NO_PRACTICAL_SEPARATION_OBSERVED`

All four independent Primary correctness checks passed. Both Cheap arms made the same minimal correction and used one final broad verification. Both Expensive arms made the same minimal correction and used one final broad verification. Neither Expensive arm created a seam or executed focused verification. Therefore the four frozen observations do not show a clear practical value difference attributable to the additional Treatment Rule.

This is not an inference that the Treatment Rule is universally ineffective. It is the frozen result for this four-turn pilot only. No extension was run or authorized by this result.

## Mechanical Primary and process evidence

| Slot | Primary | Seam | Focused verification | Candidate broad runs | Final broad | Candidate wall-clock |
| --- | --- | --- | --- | --- | --- | --- |
| Cheap Control | PASS | NO | NO | 1 | YES | 31.029 s |
| Cheap Treatment | PASS | NO | NO | 1 | YES | 41.414 s |
| Expensive Control | PASS | NO | NO | 1 | YES | 66.043 s |
| Expensive Treatment | PASS | NO | NO | 1 | YES | 61.230 s |

The detailed non-composite observations, including the per-command timing-recording limitation, are in `observations/OBSERVATIONS.md`. Raw event streams, terminal responses, launch records, independent observer results, and final source snapshots are preserved in `evidence/`.

## Durable Requirement / Contract conclusion

The Common Contract remains a durable human governance/product-scope decision. A minimal behavior-preserving structural change needed for the requested defect fix is inside autonomous fix scope; generalized refactoring or architecture improvement is outside the defect-fix objective and requires a human decision.

This pilot does **not** validate or reject that durable policy. It was not the experimental variable.

## Agent Rule conclusion

The cost-aware Treatment Rule showed no practical separation in this pilot. It has not earned retention for a confirmation study on this evidence. It is neither globally installed nor changed after the result.

## Study boundaries

- Official candidate turns: `4 / 4`; retries after model start: `0`.
- Extension recommendation: `NO`.
- v0.1 remains unchanged historical `INVALID / INSUFFICIENT PILOT` evidence.
- No Raw SQL normative change was made.

## Provenance limitation

The pre-dispatch Git freeze preserved the five possible classification labels and the observer rubric, but it did not preserve the full detailed A–E decision criteria from the pre-dispatch human instruction. Those detailed criteria therefore cannot be independently reconstructed from the freeze commit alone. This does not change the recorded four-turn observations or the `NO_PRACTICAL_SEPARATION_OBSERVED` result.
