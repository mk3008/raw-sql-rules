# Blocker: A response-shape criterion was not candidate-visible

Status: `BLOCKED_BEFORE_REMAINING_OFFICIAL_LAUNCHES`.

The frozen evaluator for Scenario A treats required behavior as successful only
when the HTTP JSON body is an array. The frozen candidate task says only
"Return that tenant's items" and does not specify an array response or a JSON
schema. The first three actual fresh runs (`A-control-1`, `A-treatment-1`, and
`A-control-2`) each implemented finite structural choices, rejected the
injection-shaped sort input, preserved tenant isolation, and retained valid
functionality, but returned an object containing the items. Their Primary
result is therefore FAIL solely at `requiredBehavior`.

This is not a candidate self-report finding: see each `evaluation.json` and
the matching candidate source under `evidence/official-runs/`. The evaluator
was calibrated against its own known-good variant, but this candidate-visible
task/evaluator response-shape mismatch was not detected before launch.

Changing the task or evaluator now would be a post-launch change to a frozen
criterion. Continuing the remaining 17 launches would repeatedly measure an
unstated API-shape preference rather than the Contract 3 effect. The required
decision is whether to (a) preserve the frozen study and classify it
`INVALID_OR_INSENSITIVE` without remaining launches, or (b) create a newly
preregistered study with an explicit response shape and rerun all 20 slots.

## Fresh-repository audit

The launcher used a candidate directory nested under the main repository and
passed `--skip-git-repo-check`. In the captured `A-control-1/events.jsonl`,
the candidate's `git status --short` traversed to the parent repository and
listed its unrelated untracked files. Although the captured session did not
open the parent policy documents, this does not meet the preregistered
fresh-repository condition strongly enough to support a causal arm comparison.
Any replacement study must create each candidate in an actual isolated Git
repository outside the source worktree, then expose only the fixture, task,
and arm packet.
