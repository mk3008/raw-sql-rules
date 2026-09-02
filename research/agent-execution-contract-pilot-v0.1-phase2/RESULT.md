# Minimal Agent Execution Contract pilot: Phase 2 result

## Pilot validity

**VALID.** Both frozen fixtures passed their pre-dispatch sensitivity check.
The later focused copy regression also passed: copied Task 1 files matched the
freeze hashes, the disposable Control repository was a clean one-commit local
repository with no remote or Treatment instruction, and it was deleted. Three
pre-turn setup incidents occurred before any model started; `AMENDMENT.md`
records them. They did not change candidate-visible content. Exactly four
official candidate turns then completed with the frozen `gpt-5.6-terra` /
medium / approval-never profile.

## Raw observations

| Slot | Final correctness | Minimal reproduction | Broad executions (reruns) | Wall-clock seconds | Post-acceptance work |
| --- | --- | --- | --- | ---: | --- |
| Task 1 Control | PASS | YES | 2 (1) | 32.822 | NO |
| Task 1 Treatment | PASS | NO | 2 (1) | 32.767 | NO |
| Task 2 Control | PASS | YES | 1 (0) | 25.826 | NO |
| Task 2 Treatment | PASS | YES | 1 (0) | 30.628 | NO |

Raw JSONL, final candidate responses, final source snapshots, and per-slot
observations are retained under `evidence/` and `observations/`.

## Per-task observations

- **Task 1:** Both arms made the minimal exit-status correction and used two
  broad test invocations. Control additionally used the focused expected-fail
  scenario; Treatment did not.
- **Task 2:** Both arms made the minimal mapper correction, used one broad E2E
  invocation, and used the focused mapper check. Treatment's measured turn was
  4.802 seconds longer; correctness was the same.

## Frozen stopping-rule classification

**`NO_CLEAR_PRACTICAL_SEPARATION`**. Treatment final correctness was not worse,
but it showed no clear same-direction practical improvement. Task 1 instead
favored Control on focused reproduction, while Task 2's timing difference is a
single small-run observation rather than a practical Treatment advantage.

## Extension recommendation

**NO.** The frozen rule permits an extension only for an obvious favorable
Treatment separation. Do not add runs automatically.

## Limits

This four-turn pilot is not statistical evidence and does not establish
universal model behavior, a cross-task causal effect, or production-wide time
savings. It only shows that this tiny fixture did not expose a clear practical
Treatment advantage worth extending under the frozen rule.
