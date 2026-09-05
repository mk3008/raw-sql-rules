# Infrastructure Amendment: Runner Transport Preflight

## Relationship to the original freeze

The original freeze remains preserved at commit `30b02eb` (manifest Git blob
`7cc6ad3e35fdf057c833fe4469095104458365a4`). This amendment adds only
`transport-preflight.mjs`, runtime diagnosis documents, and non-official preflight
evidence. It does not modify `launch.mjs`, `isolation.mjs`, `TASK-SPECS.json`,
fixture files, packets, evaluator files, model profile, execution order, primary
criteria, or candidate-visible instructions.

After this amendment, `freeze.mjs` regenerates `FROZEN-MANIFEST.json`; its
candidate-material hashes must match the original manifest for every scenario and
arm. The added harness is included in the source-file hash inventory so the
infrastructure amendment itself is reproducible.

## Change and rollback

- Change: add a one-shot, non-official runner-equivalent model transport preflight
  with a 120-second timeout and persisted JSONL/stderr/result evidence.
- Reason: distinguish an actual child launch failure from host-terminal behavior
  without changing the official candidate runner or a candidate workspace.
- Rollback: remove this harness and its `evidence/preflight/runner-transport-probe*`
  directories, then restore `FROZEN-MANIFEST.json` from commit `30b02eb`. No
  credentials, CA settings, proxy settings, or global host state are involved.

## Result

The corrected r2 preflight produced a completed model turn using the frozen model
and reasoning profile. It is not official effect data and consumes no official slot.
