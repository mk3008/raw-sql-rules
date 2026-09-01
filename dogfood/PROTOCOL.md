# Dogfood research and development protocol

This protocol is the operating contract for the human or orchestrator running
dogfood and example evaluations. It is not a repository instruction for a
candidate agent. Do not add it to root `AGENTS.md`, inject it into a candidate
prompt, or otherwise let it change the treatment being evaluated.

## 1. Primary objective

The primary objective is not maximizing first-pass correctness. It is
evaluating whether an AI can autonomously detect mistakes or evidence gaps,
make the smallest necessary repair, re-verify, re-review, and converge:

```text
implementation
  -> detection
  -> repair
  -> regression verification
  -> re-review
  -> convergence
```

An Attempt 0 defect does not by itself make a dogfood failure. A result can be
valuable when the process reaches a well-evidenced final state without human
intervention. Record every human blocker: the important observation is where
and why the AI could not converge alone, not an appearance of zero
intervention.

## 2. Preserve the process

Use this sequence as the default:

1. Freeze the initial state.
2. Save the exact implementation prompt.
3. Let the candidate agent decide it is complete.
4. Commit and freeze that state as Attempt N.
5. Save commands and test/runtime evidence.
6. Review the frozen candidate.
7. Save the review prompt, inputs, and findings.
8. Send only confirmed findings to repair.
9. Commit the repair separately.
10. Run regression verification.
11. Re-review the same relevant boundary.
12. Repeat when needed.
13. Record convergence or human escalation.

Never overwrite or erase a pre-review candidate. The product evidence includes
the uncorrected answer, the finding, the repair, and the reviewed result—not
only the final code.

## 3. Minimum evidence

Record unavailable information as `unavailable`; do not infer it.

### Initial state

- baseline SHA and branch/ref provenance;
- environment and relevant versions;
- human-prepared assets;
- intentionally absent infrastructure;
- applicable repository instructions.

### Prompt

- exact candidate prompt, verbatim.

### Attempt

- frozen SHA;
- patch/diff and changed files;
- commands, failures, and retries;
- test, runtime, and database evidence;
- dependencies and abstractions added.

### Review

- reviewed SHA;
- whether reviewer context was fresh and read-only;
- exact reviewer prompt;
- Rules and documents supplied to the reviewer;
- findings verbatim, with evidence and impact;
- uncertainty and evidence gaps.

### Repair

- exact repair prompt;
- repair SHA;
- changed behavior;
- added or changed regression evidence.

### Final

- final SHA;
- final independent verification;
- confirmed unresolved defects;
- evidence limits;
- human interventions;
- convergence status and round count.

## 4. Review hypothesis discipline

Do not assume dedicated Raw SQL Review Rules exist or are necessary. The
default hypothesis is that a fresh reviewer given the candidate, requirements,
canonical DDL, and Raw SQL Rules can autonomously find important problems with
an ordinary request to review.

Consider Review Rules only after evidence shows important findings are
repeatedly missed under Raw SQL Rules alone. When evaluating a Review Rules
candidate, compare it blind against the same frozen candidate where practical:

| Arm | Inputs |
| --- | --- |
| A | requirements, canonical DDL, candidate, Raw SQL Rules |
| B | the same inputs plus frozen Review Rules candidate |

Do not repair the candidate before comparison reviews complete, and do not
tell reviewers known findings. Compare confirmed-defect detection, missed known
defects, false positives, style/naming noise, actionability, repairability,
human intervention, and review overhead.

## 5. Source clarity and comments hypothesis

Do not treat SQL comments or source-clarity rules as completed rules. Observe
whether an SQL asset is understandable on its own, including:

- query-owned fixed semantics and caller-owned runtime variability;
- fake generic parameters;
- non-obvious business intent;
- correctness, concurrency, and locking assumptions;
- WHY / WHY NOT and meaningful query stages;
- unnecessary comments or syntax narration.

Do not presuppose that more comments are better or that every magic literal
needs a comment. For example, evaluate `WHERE status = 2` from evidence: is
canonical DDL sufficient, would `-- success` help, or would a different SQL
contract be clearer?

## 6. Finding ledger

Maintain a traceable finding ledger. The storage format is flexible, but each
finding should support at least:

| Field | Meaning |
| --- | --- |
| Finding ID | Stable local identifier. |
| Detected at | Attempt and review round. |
| Finding / detector | Claim and agent or reviewer that made it. |
| Evidence / impact | Direct support and consequence. |
| Existing Rule coverage | Applicable Rule, or `none` / `unavailable`. |
| Classification | One of the classifications below. |
| Disposition | confirmed, rejected, uncertainty, deferred, or escalated. |
| Repair SHA | Repair commit, if any. |
| Regression evidence | Test or runtime proof, if any. |
| Re-review result | Result after repair. |
| Human intervention | Type and reason, if any. |

## 7. Finding classification

Use classifications that prevent every finding from becoming a Raw SQL Rule:

| Classification | Meaning |
| --- | --- |
| `covered-miss` | Existing Raw SQL Rules already substantially cover it; an agent missed them. One miss does not change Rules. |
| `raw-sql-rule-gap` | Important implementation-contract candidate not substantially covered by existing Rules. |
| `review-rule-candidate` | More appropriate for stable review detection than first-pass generation. |
| `source-clarity-candidate` | Standalone SQL readability, comments, query stages, or parameter/literal ownership. |
| `general-code` | Non-Raw-SQL-specific filesystem, HTTP, language, runtime, or similar issue. |
| `requirement-ambiguity` | Requires a specification decision rather than a Rule. |
| `tooling-product` | Installer or other product/tool defect outside Raw SQL Rules. |

Equivalent names are acceptable when their boundary remains clear.

## 8. Rule pressure

A finding does not immediately justify changing Rules. Preserve a single case
as candidate evidence. Consider a Rule change only after accumulating evidence
such as repeated independent misses, repeated misunderstanding by agents that
read the Rule, high severity, stable reviewer detection, or recurring human
intervention.

Keeping Raw SQL Rules small is itself an evaluation target.

## 9. Recovery discipline

For a confirmed finding:

- repair only the scope needed for that finding;
- do not introduce an unrelated redesign;
- do not weaken tests to pass;
- add regression evidence when feasible;
- re-check the same review and verification boundary after repair.

An uncertainty alone is not a confirmed defect and must not force a repair.

## 10. Convergence

Do not define success as a clean Attempt 0. Record whether the process reached
all applicable conditions:

- relevant automated and real-database verification passes;
- review has no confirmed remaining defect, or each remaining defect has an
  explicit reason;
- repaired findings have regression evidence;
- unresolved evidence gaps are explicit;
- human interventions are recorded;
- missing requirements are escalated instead of silently decided.

Record the number of convergence rounds.

## 11. Human blockers

Treat human intervention as valuable data. Record `none` when there was no
intervention, otherwise classify it, for example, as environment/tool
limitation, requirement ambiguity, product defect, architecture/product
decision, destructive or external action confirmation, reviewer failed to
detect, or repair failed to converge.

## 12. Evidence and product claims

Separate Observed, Inference, and Hypothesis. A successful dogfood does not
by itself establish universal language or DBMS independence, perfect first-pass
generation, or either the need for or absence of Review Rules. Do not add or
formalize Review Rules without the hypothesis comparison above.

## Precedent: PR #10

`dogfood/csharp-vsa-postgres/` is a concrete precedent, not a template to copy
mechanically. Its useful process evidence is that Attempt 0 was frozen, green
tests still received review findings, confirmed findings were repaired in a
separate commit, regression coverage was strengthened, final review converged,
and historical experiment boundaries were recorded.
