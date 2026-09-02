# Raw SQL harness sensitivity study v0.3

## Status

Preregistration preparation. No official candidate has been launched.

## Fixed conditions

- Repository start commit: `5d40e0d4ba64e3bfb9c073da295385906aba4785`
- Study branch: `codex/benchmark-rawsql-harness-sensitivity-ts-v0-3`
- Candidate model: `gpt-5.6-terra`, reasoning effort `medium`
- Reviewer model: `gpt-5.6-sol`, reasoning effort `high`; no substitute is permitted.
- Control receives the neutral TypeScript/node-postgres fixture with no Raw SQL Rules material.
- Treatment receives the same fixture and a normal installation from released Raw SQL Rules commit `dceb234b42ffa7b32c1a54e0cce0666580c8f68f`.
- Official candidates are serial, use isolated one-commit local Git repositories with no remote, and have ordinary shell, filesystem, Docker, and network capability.
- Exactly four official model turns are allowed. A confirmed model-turn start atomically consumes one of the four slots. Phase 2 and timing measurements are prohibited.

## Frozen candidate sequence

The fresh randomized serial order is recorded in `execution-order.json` before the official gate opens:

1. S01 Control
2. S02 Treatment
3. S02 Control
4. S01 Treatment

## Quality and review

The transferred mechanical evaluator is the fixed primary endpoint. After all four final sources and primary results are frozen, opaque randomized review packets will be given to the required Sol reviewer. Findings will be mechanically reproduced without changing candidate code. `ADVERSARIAL_ADJUDICATED_QUALITY` is PASS only when Mechanical Primary is PASS and no task-relevant objective defect is confirmed.

## Evidence controls

All candidate evidence is frozen before cleanup. Candidate source archives, manifests, patches, reconstruction checks, Git baseline/final state, events, response, arm identity, and evaluator output are retained. Historical study result evidence is neither imported nor used.
