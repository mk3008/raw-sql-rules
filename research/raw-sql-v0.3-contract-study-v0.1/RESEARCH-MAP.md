# Raw SQL v0.3 contract study v0.1 — Research Map

## Status

Planning only. This document fixes the questions to answer before any official
candidate launch. It does not change `raw-sql-rules.md` or make a product
decision.

## Baseline

- Baseline `main`: `f742ca1c27d0ddd0b9f464bbc487181a2a64d2d3`
- Candidate profile for any new official effect study: `gpt-5.6-terra`, medium
  reasoning, fresh repository/context, identical sandbox and runtime profile.

## Questions and evidence plan

| ID | Question | Existing evidence | New evidence needed? |
| --- | --- | --- | --- |
| Q1 | Is current Contract 1 Scope, Contract, or Requirement? | v0.1 reclassification and v0.2 feasibility | No; synthesize. |
| Q2 | Is current Contract 2 Scope, Contract, or Requirement? | v0.1 reclassification and v0.2 feasibility | No; synthesize. |
| Q3 | What does Contract 3 concretely prohibit? | Normative text and v0.1 safety analysis | No for meaning; use scenarios for behavior. |
| Q4 | Are current Default Requirements feasible as author defaults? | v0.2 feasibility | No new broad study; record limits. |
| Q5 | Does Terra naturally preserve Contract 3 without the Contract? | No isolated current evidence | Yes. |
| Q6 | Does adding Contract 3 reduce unsafe final results? | No isolated current evidence | Yes. |
| Q7 | Does adding Contract 3 affect candidate self-repair? | No isolated current evidence | Yes; secondary observation. |
| Q8 | Does Contract 3 over-block safe functionality? | No isolated current evidence | Yes. |
| Q9 | Does Contract 3 wording have ambiguity, gaps, or excess? | Normative/reclassification text | Yes; scenario observations plus textual analysis. |
| Q10 | Which current Contracts deserve isolated safety-effect study? | Classification synthesis | No separate launch; select before freeze. |
| Q11 | Do Scope, Contracts, and Defaults conflict semantically? | Normative text and prior synthesis | No; synthesize. |
| Q12 | Which v0.3 actions are KEEP/MOVE/NARROW/REVISE/REMOVE candidates? | All above | No until final synthesis. |

## Planned new effect study

The candidate-visible difference is only a frozen Contract 3 safety boundary;
Scope and author-default Requirements are byte-identical across arms. Five
scenarios will independently cover runtime sort/identifier choice, optional
filter, unsafe composition precedent, stored/internal-origin text, and
boundary-pressure repair. The preregistration will require two fresh runs per
arm/scenario (20 official launches), calibration, frozen evaluator criteria,
and a post-run synthesis before any product recommendation.

## Existing evidence to synthesize

- `raw-sql-rules.md`
- `RATIONALE.md` and `EVIDENCE.md`
- `research/raw-sql-rules-v0.1-reclassification.md`
- `research/raw-sql-v0.2-feasibility-v0.1/`
- `research/raw-sql-v0.2-subtraction-gate-v0.1/`

## Non-goals

No normative product-file, README, installer, framework, package, or CLI
change is authorized by this study.
