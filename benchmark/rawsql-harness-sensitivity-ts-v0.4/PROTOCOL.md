# Raw SQL harness sensitivity study v0.4

## Status

Preregistration preparation. Official candidate count: 0.

## Fixed conditions

- Base commit: `5d40e0d4ba64e3bfb9c073da295385906aba4785`.
- Candidate: `gpt-5.6-terra`, reasoning effort `medium`.
- Reviewer: `gpt-5.6-sol`, reasoning effort `high`; substitution is prohibited.
- Treatment release commit: `dceb234b42ffa7b32c1a54e0cce0666580c8f68f`.
- Official candidates use `codex exec --json -m gpt-5.6-terra -c model_reasoning_effort='"medium"' -s workspace-write` in a fresh one-commit local Git repository with no remote.
- Four official turns, serial only: S01 Control, S01 Treatment, S02 Control, S02 Treatment in the randomized order frozen in `execution-order.json`.

## Gates

Before the official counter opens, all CAL01--CAL11, three runner qualifications, arm identity verification, and a non-study candidate-sandbox Docker/PostgreSQL qualification must pass. A candidate launch is recorded only after a durable `thread.started` and `turn.started` event. Any prelaunch failure stops the study without consuming a slot.

## Evaluation

The mechanical evaluator records two independent states: (A) the candidate's normal declared `npm start` artifact before rebuilding; and (B) a clean reconstruction from the frozen source. A failure in A cannot be masked by B. The primary score covers endpoint behavior, PostgreSQL state, integrity, atomicity, idempotency, concurrency, startup, published-artifact behavior, and schema/baseline preservation only.

Blind Sol review happens only after all four candidate source trees and mechanical results are frozen. Packets are opaque and omit arm, run order, treatment material, evaluator results, and all other candidate code. Findings are independently reproduced against frozen artifacts and classified without changing candidate code.

## Invalidity conditions

Any candidate-sandbox Docker mismatch, arm or prompt mismatch, evidence loss, failed qualification/calibration/evaluator, model substitution, isolation violation, or unauthorized official launch makes the study `MEASUREMENT-INVALID`.
