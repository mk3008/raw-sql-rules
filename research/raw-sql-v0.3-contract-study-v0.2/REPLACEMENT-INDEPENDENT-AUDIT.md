# Independent Audit: Replacement Exception

## Scope

An independent read-only auditor reviewed the current diff from `bc5d4c4`, the
runner, freeze, execution order, replacement exception, original interrupted
evidence, snapshot, and model-free regression evidence.

## Result: PASS

- Only `A-control-1-replacement-1` is accepted; ordinary slots and every other
  replacement ID remain fail-closed.
- Original `A-control-1` evidence is preserved and the regression harness hashes
  it before and after replacement checks.
- The original attempt has `thread.started` and `turn.started`, but no candidate
  model message, tool call, completed turn, source change, or evaluator result.
- The model-free regression directly proves approved replacement preflight,
  ordinary duplicate rejection, and unapproved replacement rejection before spawn.
- Candidate material hashes, evaluator, packets, profile, and permissions remain
  unchanged; only infrastructure/lifecycle metadata differs.
- The protocol defines 21 total launches, 1 infrastructure exclusion, and 20
  effect-data evaluations. This is a planned aggregation, not yet an outcome count.

No concrete blocker was identified before the approved replacement launch.
