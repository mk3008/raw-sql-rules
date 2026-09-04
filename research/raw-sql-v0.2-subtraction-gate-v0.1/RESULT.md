# Raw SQL v0.2 subtraction gate v0.1 result

## Result

`NO_PRACTICAL_SEPARATION_OBSERVED`

The frozen v0.2 Contracts and Requirements were present in both arms.  The
only candidate-visible difference was the Guided arm's frozen G1--G5 legacy
operational/HOW bundle in addition to the same minimal Raw SQL pointer.

All four official candidates completed, and every independently evaluated
final tree passed Primary quality.  Reduced had no confirmed final defect
unique to it, and it needed no human technical correction.  Guided performed
some additional verification and introduced helpers/tests in two runs, but no
Guided-only action found or corrected a defect that remained in Reduced.  Those
extra actions therefore do not meet the frozen threshold for a clearly material
process-only difference.

This is a bounded bundle-level result.  It supports subtraction of the tested
non-Requirement layer from this v0.2 candidate; it does not establish that each
individual G1--G5 sentence has no isolated effect.

## Frozen conditions and qualification

- Starting main: `396aecbb5a57c4b20457969540c73aef1aa6b261`
- Frozen PR #33 candidate: `ceed1cf7c91cce4dab01e48f05ec2d941439273e`
- Pre-dispatch freeze: `ba460cdd8eef9df415277b7e4933d0472d280b33`
- Candidate profile: `gpt-5.6-terra`, medium reasoning,
  `danger-full-access`, approval `never`
- Official order: Task A Reduced, Task A Guided, Task B Reduced, Task B Guided
- Official launches: `4 / 4`; retries after `turn.started`: `0`

The frozen candidate copy has SHA-256
`989ea5bd3758b948fc0855b331d0e2d863769cb4c17656b4cae27bee4fa61c47`.
`calibration.json` records PASS: the evaluator accepted both known-good
variants and rejected both known-bad variants.  The Task A bad variant exposed
query-safety/optional-filter defects; the Task B bad variant exposed the real
node-postgres/PostgreSQL bigint representation defect.

Pre-turn infrastructure-only amendments are recorded in `AMENDMENT-01.md`
through `AMENDMENT-05.md`.  They changed neither candidate-visible bytes,
experimental semantics, profile, order, evaluator criteria, nor classification.

## Official observations

| Slot | Primary | Candidate wall-clock | Real DB by candidate | Fresh review before merge | Focused / broad re-verification | Material Guided-only correction |
| --- | --- | ---: | --- | --- | --- | --- |
| Task A Reduced | PASS | 150.659 s | yes | yes | focused / no | no |
| Task A Guided | PASS | 184.114 s | yes | yes | focused / yes | no |
| Task B Reduced | PASS | 74.458 s | yes | not applicable to its completion path | no / no | no |
| Task B Guided | PASS | 225.075 s | yes | not applicable to its completion path | focused / yes | no |

Every run inspected DDL, observed/localized the seeded feature or DB failure,
repaired it, completed its local integration boundary, and required no human
intervention.  Both Task A candidates performed an explicit fresh review before
their merge; neither review found a new defect or triggered a repair.  Both
Task B candidates performed real PostgreSQL/driver checks.  Guided added a
DB-backed regression path in Task A and a small named-review-surface lowering
helper plus real-DB regression path in Task B.  Reduced independently reached
correct, evaluator-PASS final trees without those additions.

Raw evidence is retained under
`evidence/run-89bfec8bc8914b33bb69a39cebda2a9f/`: lifecycle event streams,
final-source snapshots, arm manifests, calibration, per-slot mechanical-primary
results, and observations.  The four
`mechanical-primary-*.json` files each record `PASS` with no confirmed defects.

## Interpretation and PR #33 implication

The earlier No-Rules-vs-Full-Rules studies asked whether adding the complete
Raw SQL Rules product to a neutral prompt improved bounded outcomes/process
over no Raw SQL guidance.  This study asked a different question: given the
same frozen v0.2 Contracts and Requirements, whether removing the legacy
non-Requirement operational/HOW bundle worsened outcomes/process.  They must
not be conflated.

Both arms passed both tasks and both independently used the real DB boundary.
The Guided arm's extra review/testing did not produce an outcome-changing
correction.  Together with the earlier no-practical-separation evidence, this
strengthens the bounded case that PR #33 may proceed unchanged.  It does not
justify a universal claim about every legacy sentence or authorize a
per-guidance ablation.

## Limitations

This is four serial turns across two compact PostgreSQL fixtures; it is not a
claim of universal agent behavior.  The bundle comparison cannot identify an
isolated G1--G5 effect.  The completed runner summary is authoritative for
completion and count (`RUN-SUMMARY.json`: `COMPLETE`, `4 / 4`); its separate
launch-state file retained `state: RUNNING` after completion.  That stale label
does not alter the durable count, lifecycle evidence, candidate outputs, or
mechanical results, and was not changed after official execution began.
