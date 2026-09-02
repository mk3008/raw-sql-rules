# Agent Execution Contract: minimal failure-handling pilot v0.1

## Status and scope

This is a design for a small, unexecuted pilot. It is not a general Agent
Execution Contract and is not part of Raw SQL v0.2. It does not create a
fixture, dispatch a candidate, or change any benchmark evidence.

The sole hypothesis is whether a short failure-handling instruction produces an
obvious practical behavior difference in small deterministic defect tasks.

## Treatment text

> When a failure occurs, localize it before broad verification. Preserve the
> smallest deterministic reproduction. Make the smallest correction addressing
> that cause. Verify it first with the smallest relevant check. Broaden
> verification only when remaining risk justifies it.

Control receives the same task packet, repository state, defect report, and
acceptance criteria without this text. Treatment receives exactly the Control
packet plus the quoted text. No additional progress, checkpoint, time-budget,
E2E-hierarchy, or stopping instructions are supplied to either arm.

## Frozen initial design: exactly four candidate turns

| Task | Control | Treatment | Observer-only focused check | Existing broad path |
| --- | --- | --- | --- | --- |
| 1. Expected-failure exit status | One candidate turn | One candidate turn | A deterministic runner scenario in which the final expected-fail case is recorded as handled and the process must exit `0` | The fixture's full test command exercises all scenarios |
| 2. E2E response mapping regression | One candidate turn | One candidate turn | A deterministic handler/mapper regression check that proves the incorrectly mapped response field after the local fix | The fixture's existing cheap end-to-end command drives the same route |

Total maximum: **2 tasks × 2 arms = exactly 4 candidate turns**. There are no
repetitions, no fifth candidate, and no automatic rerun after a candidate turn
has started.

The focused check, known repair, and preflight expectations are observer-only
metadata. Candidate packets contain only the same neutral defect report,
repository state, and acceptance criteria; they must not name or prescribe the
focused check. Candidate-facing descriptions state the symptom and acceptance
condition without identifying the narrow reproduction boundary. If the fixture
does not leave a genuine behavioral choice between focused and broad
verification, classify it as **INVALID / INSUFFICIENT PILOT**.

The pilot uses a new tiny fixture only if a later phase is approved. It should
be small enough to run in seconds, have checked-in deterministic inputs and
expected outputs, and use ordinary commands and a preserved event log. It must
not reuse the large v0.5/v0.6 machinery unless a demonstrably tiny, stable
launcher component is useful.

### Task 1: expected-failure exit status

The fixture will contain a small test/scenario runner and an existing broad
test command. Its seeded defect handles the final expected-fail scenario for
reporting purposes but leaves the process exit code at `1`, so the broad suite
reports PASS while the command still fails. The candidate-facing task reports
that symptom and asks for the documented command contract to be restored. A
focused deterministic invocation of the final scenario is retained only as
observer metadata to reproduce and prove the exit-status behavior.

This resembles a real observed class of failure without copying benchmark
infrastructure. It creates a natural choice between first isolating the last
scenario and repeatedly running the full suite.

### Task 2: E2E response mapping regression

The fixture will contain a tiny application route, a cheap existing end-to-end
command, and a pure or near-pure mapping boundary. Its seeded defect maps one
specified response field incorrectly while the route remains runnable. The
candidate-facing task states the observed response-contract failure without
identifying the mapping boundary. A narrow deterministic regression check is
retained only as observer metadata; the existing E2E path remains relevant but
broader.

Before dispatch, an operator must confirm that both the focused check and broad
path fail on the seeded defect and that the focused check passes after the
known minimal repair. If that preflight fails, the pilot is **INVALID /
INSENSITIVE** rather than repaired into a larger system.

## Observation record

Keep one raw event log per candidate turn and an observer record containing
only the following fields:

1. **Final correctness:** whether the requested defect is fixed by the
   task-specific acceptance check.
2. **Minimal reproduction:** whether the candidate used a focused,
   deterministic check to localize the seeded defect and verify the minimal
   correction, regardless of whether it created a new test artifact.
3. **Broad reruns:** count of broad/E2E/full-suite reruns after localization
   was possible.
4. **Wall-clock time:** elapsed time from candidate dispatch to its terminal
   response.
5. **Post-acceptance work:** after the minimal acceptance condition first
   passed, whether it continued unrelated cleanup or broad verification.

Do not calculate a composite score. Preserve command/event observations, the
time boundaries, and the reason for each count. Treat wall-clock time as a
secondary cost reported alongside final correctness: shorter time is not an
improvement when correctness differs. Record fixed harness or setup overhead
separately where observable. The observer must define
“localization was possible” before dispatch as the point at which the provided
focused reproduction could identify the seeded defect.

## Frozen stopping rule

After the four planned candidate turns, inspect the raw observations once.

- If Control and Treatment behave materially the same on both tasks, record
  `NO_PRACTICAL_SEPARATION_OBSERVED` and stop. Do not increase the sample size
  merely because four turns are insufficient for statistical inference.
- If Treatment has a clear, same-direction practical improvement while final
  correctness is not worse—for example, focused regression use where Control
  performs broad reruns, materially fewer broad reruns, less post-acceptance
  work, or meaningfully shorter wall-clock time—recommend, but do not execute,
  a human-approved matched extension of only 2–4 additional runs.
- If the fixture or measurement cannot expose the distinction, record
  **INVALID / INSUFFICIENT PILOT**. Do not infer a Contract effect and do not
  build a large harness; propose only the smallest fixture or measurement
  correction.

The purpose is practical separation, not statistical significance. Time and
human attention are costs, so neither arm is rewarded for broad activity that
does not establish the requested result.

## Unresolved operational choices for a later approved phase

- Choose the smallest language/runtime that can provide both tasks and exact
  event capture without test-framework machinery obscuring the behavior.
- Freeze the task packets, command names, known repairs, observer sheet, and
  acceptance checks before any candidate dispatch.
- Decide who will perform the human decision after the four-run stopping rule.
