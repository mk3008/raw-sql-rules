# Preregistration: C# VSA PostgreSQL owner reassignment

Frozen before candidate implementation in commit `27829717fc12e2eb70e6008b26ae2e46fd5ae709`.

## Baseline and objective

- Starting remote `main`: `3360fb38abe73fada24dc051593f251fa4f61206`.
- Objective: observe one connected loop from initial human instruction through implementation, independent Raw SQL Rules-only review, adjudication, recovery or verification strengthening, re-review, and convergence. First-pass correctness was not the success condition.
- No known answer key, dedicated Review Rules, or Source Clarity Rules were supplied.

## Boundaries

- The initial instruction was the only human product instruction for this run.
- Candidate and reviewers were not given historical dogfood findings, calibration results, repair examples, or specialized review checklists.
- Candidate modification was prohibited during review snapshots.
- Reviewers received the feature requirements, candidate snapshot, canonical DDL, installed Raw SQL Rules, and applicable application instructions only.
- A human blocker meant a requirement ambiguity, sensitive/private decision, external or destructive-action confirmation, or an environment/tool limitation that could not be resolved autonomously.

## Method and convergence criteria

The candidate would be frozen as Attempt 0 before review. Fresh reviewers would report confirmed defects, resolvable evidence gaps, and uncertainties. Findings would be recorded on the application PR; recovery would adjudicate before action and keep code repair separate from verification strengthening.

Convergence required real-PostgreSQL tests, published-application verification, terminal review dispositions, no unresolved confirmed defect, explicit treatment of important evidence gaps and ambiguities, a final fresh review, a clean diff check, and recorded human interventions.
