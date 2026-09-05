# v0.3 research synthesis

## Evidence layers

| Layer | Result | Interpretation boundary |
| --- | --- | --- |
| Frozen Primary | 20/20 PASS; 21 launches, one infrastructure exclusion | Small fixed study; no detected arm difference. |
| Post-hoc verifier | Initial version: 15 PASS / 5 health errors, all rerun PASS. Independent-review revision: 14 PASS / 6 health errors, all rerun PASS. | Not preregistered and not a replacement Primary. |
| False-pass calibration | B and D bad variants: frozen evaluator PASS, post-hoc FAIL | Establishes evaluator coverage holes, not a candidate defect. |
| Candidate process observation | Saved events/final snapshots are available, with incomplete timing/history in some runs | Descriptive only; no causal arm conclusion. |
| Default Requirement review | All 20 final artifacts retain application SQL in `src/server.js` (D1 not attained); D2 is mixed (10 named-review comments, 10 positional-only); D3 and D4's path are attained | Separate post-hoc author-default axis; packet conformance and feasibility are distinct. |

## Post-hoc result

`POSTHOC-PLAN.md` records the method before execution. The new verifier checks
only frozen `TASK-SPECS.json` requirements that the coherence audit had already
identified as unexercised: finite/default inputs, omitted values, both tenants,
success-array shape, duplicate rejection, and D's full projection. It does not
add business behavior or a general quality criterion.

Its initial 15 PASS / 5 `health failed` result is an environment observation,
not five candidate failures. Independent review then strengthened `tenant_id`
identity and E duplicate checks; the revised run had 14 PASS / 6 health errors.
Each error source passed one diagnostic rerun. The rerun records support
separating these from candidate outcomes. Revised retained stderr records
`listen EACCES` on loopback ports; this is the observed failed mechanism, not
a determination of its OS-side cause.
B and D calibration intentionally demonstrated the review-reported holes:
the frozen evaluator accepts B tenant-b HTTP 500/non-array and D detailed
wrong-tenant/incomplete projection, whereas this verifier rejects them.

Accordingly, the post-hoc data support only that the 20 preserved final
sources passed the added checks after resolving verifier-environment errors.
They are not a comprehensive guarantee of all `TASK-SPECS` requirements, do
not alter the preregistered 20 PASS count, and do not establish an arm effect.

## Process observations and Secondary

`safeFromFirstImplementation` and `unsafeFinalResult` in the frozen evaluator
are derived from `options.variant`; they are retained raw calibration fields
but are **not** official-candidate process observations and have no secondary
interpretation here.

For each official run, `events.jsonl` can show lifecycle events, agent messages,
file-change events, executed commands, exit status, and sometimes command
output. `final-source` establishes final state. It cannot reliably reconstruct
an initial implementation, all edits, or self-repair when an event/output is
absent. The conservative per-run classification is therefore:

| Observation | Classification |
| --- | --- |
| Initial implementation before first file change | `UNKNOWN` unless a retained event/diff proves it |
| Self-repair | `OBSERVED` only for a retained later file-change after a retained failing check; otherwise `UNKNOWN` |
| Final implementation | `OBSERVED` from `final-source` |
| Candidate DB verification | `OBSERVED` only when its own event records the command/result; evaluator Docker work is excluded |
| A-control-1 | no implementation/process result; infrastructure exclusion |

This avoids turning candidate self-report into fact or counting evaluator DB
work as candidate verification. `PROCESS-OBSERVATIONS.md` records all 20
rows, including event IDs and final snapshots. The saved event streams show
candidates reading their task and fixture, changing `src/server.js`, and often
running syntax or HTTP checks; they do not provide a uniformly complete
self-repair timeline. No arm-level self-repair conclusion is justified.

## Author Default Requirements (descriptive, non-Primary)

`DEFAULT-ATTAINMENT.md` distinguishes three layers: earlier technical
feasibility, the abbreviated common-packet summary, and actual conformance of
the frozen final artifacts to the current Defaults. The packet omitted the
Default-1 dedicated-source-*file* condition. All 20 final artifacts instead
retain executable SQL in `src/server.js`, so Default 1 is `NOT_MET`. Default
2 is mixed: 10 artifacts identify each positional placeholder with a directly
adjacent meaningful-name SQL comment (treated as `MET` at the review surface),
and 10 leave positional placeholders alone (`NOT_MET`). The directly
inspectable fixture schema (Default 3) and target DB/driver verification path
(Default 4) are `MET`.
Whether a candidate actually executed that path is separately recorded and is
not part of Default 4 attainment. This does not turn the omitted prompt detail
into a candidate instruction-following failure, nor does it weaken the
current Defaults. It is not evidence that every project must use these choices,
that customization fails, or that Contract 3 caused the attainment.

## Research Map answers

| Q | Answer and evidence | Remaining uncertainty |
| --- | --- | --- |
| Q1 | Contract 1 remains a selected-representation Contract; feasibility supports practical use. | Cross-stack generality untested. |
| Q2 | Contract 2 remains an application-ownership Contract/boundary. | Whether presentation should be Scope is a product choice. |
| Q3 | Contract 3 prohibits arbitrary runtime SQL syntax while allowing reviewed finite variation. | Exact wording effects beyond fixtures untested. |
| Q4 | Earlier feasibility supports Defaults in bounded PostgreSQL stacks; these final artifacts attain D3/D4 path, not D1, and have mixed D2 attainment under the stated review-comment interpretation. | Universality and desirability are untested. |
| Q5–Q6 | Frozen Primary found no detected arm difference (20 PASS). | Insensitive small sample; no equivalence/effect claim. |
| Q7 | Per-run events show some candidate verification and environment recovery, but only one bounded later-source-change observation and no causal arm inference. | Initial implementation and most self-repair remain `UNKNOWN`; variant-derived Secondary is invalid. |
| Q8 | Both arms retained tested safe functionality in Primary and post-hoc checks. | Broader usability/performance untested. |
| Q9 | Textual meaning is coherent; evaluator gaps were measurement defects, not Contract defects. | Product wording remains a human decision. |
| Q10 | Contract 3 remains the only isolated runtime-syntax safety boundary. | No evidence requires another isolated study. |
| Q11 | Existing Scope/Contracts/Defaults remain semantically compatible. | Contract 1 over-reading risk remains editorial. |
| Q12 | Recommendations below. | No normative change is made by this PR. |

## v0.3 proposal (for human product review)

| Current item | Candidate action | Basis |
| --- | --- | --- |
| Scope | KEEP | No contradiction or contrary evidence. |
| Contract 1 | KEEP | Feasibility and representation boundary evidence. |
| Contract 2 | KEEP; consider MOVE only as product presentation choice | Ownership boundary is durable; data do not decide placement. |
| Contract 3 | KEEP | Core safety meaning is clear; no measured reason to revise. |
| Default 1–4 | KEEP as Defaults | Bounded feasibility and product intent, not false attribution of D1 or uniformly positive D2 attainment to these 20 artifacts. |
| Legacy operational/HOW bundle | REMOVE/NARROW candidate | Earlier subtraction gate found no practical separation; not an isolated sentence-level claim. |

Scenario D measured finite report selection and stored-text rejection, not a
general property of all stored strings. Scenario E measured finite limit/status
behavior under a small fixture, not actual performance, repair quality, or a
general performance-pressure claim. No further candidate runs were added to
seek a difference.
