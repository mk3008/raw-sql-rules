# Preregistration — Raw SQL Rules-only review calibration

- Current main SHA: `168f4a0d0c34628c7b6912c3791ec9d4b94c2b62`
- Frozen candidate SHA: `30dca66ec9aa4014cc4e7d092f5e2d6c474d6e9f`
- Preregistration commit SHA: recorded after this document is committed and
  before any reviewer run starts.
- Arm: A, Raw SQL Rules only; no Review Rules or Source Clarity Rules.
- Reviewer runs: three independent fresh, read-only runs with byte-identical
  review prompt and inputs.
- Model / effort: `unavailable` unless observable in a run record.
- Candidate modifications: prohibited.

## Research question

For a fresh reviewer supplied only the frozen candidate, feature requirements,
canonical DDL, and installed Raw SQL Rules, what important defect or evidence
gap detection is autonomous and reproducible? This is a detection baseline;
it does not evaluate a Review Rules candidate, modify the candidate, or repair
findings.

## Inputs and isolation

For each run, export the candidate with `git archive` from the frozen candidate
SHA into a new temporary directory. The export contains no `.git` directory or
repository history. Reviewers receive only that directory plus the prompt in
`prompts/raw-sql-rules-only-review.md`; the required DDL and installed Rules
are inside the snapshot. They must not inspect current main, PR #10 evidence,
later commits, known findings, scoring material, or other reviewer outputs.

## Freeze and scoring plan

Save and freeze all three reviewer outputs under `runs/` before reading the
historical Attempt 0 review as an answer key or scoring any run. Afterward,
score each known corpus item as confirmed defect, detected but downgraded,
missed, or contradicted. Validate additional findings read-only against the
candidate, requirements, DDL, and database behavior when useful.

Human intervention is recorded per run. If a human supplies a finding to a
reviewer, that run is not blind evidence.
