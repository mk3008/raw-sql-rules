# Raw SQL Rules 0.1 readiness decision

## Verdict: KEEP-AS-IS

Keep the current normative `raw-sql-rules.md` unchanged for 0.1. The evidence contains no confirmed repeated Raw SQL implementation-contract gap, no repeated independent misunderstanding of an existing Rule that calls for wording repair, and no evidence that current normative text is harmful or misleading.

## Strongest evidence for the verdict

- The clean primary C# / ASP.NET Core / PostgreSQL / VSA dogfood used installer-generated discovery and showed native Npgsql, external SQL assets, finite reviewed selection, named binding, canonical DDL, and database-backed verification under the current Rules.
- The end-to-end owner-reassignment run preserved a frozen Attempt 0, used fresh Raw-SQL-Rules-only review, selected verification strengthening rather than needless behavior changes, and converged with final fresh review reporting no confirmed defect.
- Repeated evidence gaps around finite selection, database transaction rollback, timestamps, and no-op behavior were handled by the existing real-database verification boundary in Rule 8. They are pressure to use the Rule, not evidence that new normative language is absent.
- Requirement ambiguities were preserved as ambiguities rather than converted into business-semantic Rules.

## Strongest evidence against overclaiming

- Blind review detection was useful but not complete or uniformly stable; its historical corpus was comparison evidence, not ground truth.
- The confirmed publish-asset failure was a real deployment defect, but Rule 2 deliberately leaves asset bundling application-owned. It is not a Raw SQL contract gap.
- Current direct product evidence is narrow: Windows 11 / PowerShell 7.6.5, .NET 9, Npgsql, PostgreSQL, and a small number of features and reviewer contexts.

## Rule pressure review

| Current Rule | Supporting evidence | Observed misunderstanding or failure | Decision |
| --- | --- | --- | --- |
| 1. One visible query representation | C# dogfood and owner reassignment used Npgsql + SQL assets, with no ORM/query builder/repository layer. | None observed. | Keep. |
| 2. Application SQL is source | SQL assets were visible and reviewable; publish packaging had to preserve them. | P-01 packaging failure was application deployment configuration, explicitly outside Rule ownership. | Keep; do not add packaging prescription. |
| 3. Current schema is directly inspectable | Canonical PostgreSQL DDL was available to candidates/reviewers. | Historical fixture setup was an evidence gap, not DDL discoverability failure. | Keep. |
| 4. Runtime data never supplies SQL syntax | Finite sort-to-asset selection was observed and reviewed. | Coverage gaps, not unsafe dynamic syntax, were found. | Keep. |
| 5. Preserve parameter meaning | Named Npgsql placeholders/bindings were observed in the tested scenario. | None observed. | Keep. |
| 6. Make non-obvious SQL reviewable | Current bounded comment rule remains compatible with the examples. | No direct clarity failure or harmful restriction; natural reviewers did not raise clarity findings. | Keep; evidence insufficient for expansion or removal. |
| 7. Keep application ownership with the application | VSA coexistence and ambiguity handling retained business/deployment decisions in the application. | Reviewers correctly did not invent repeat/idempotency semantics. | Keep. |
| 8. Verify behavior at the real database boundary | Real PostgreSQL testing repeatedly closed asset-selection, page-size, rollback, timestamp, and no-op proof gaps. | Agents initially left some evidence gaps, but no contradictory or harmful wording was observed. | Keep; this is the strongest reinforced Rule. |

Rule additions recommended now: **none**. Rule changes recommended now: **none**. Rule removals recommended now: **none**. Evidence is insufficient for any of those changes.

## Separate decisions

- Dedicated Review Rules: **DO NOT ADD** for 0.1. See [REVIEW_RULES_DECISION.md](REVIEW_RULES_DECISION.md).
- Source Clarity Rules: **KEEP AS UNPROVEN HYPOTHESIS**. See [SOURCE_CLARITY_DECISION.md](SOURCE_CLARITY_DECISION.md).
- Tooling/product: retain PowerShell 7+ as the tested Windows installer boundary; do not infer PowerShell 5.1 or all deployment styles.

## One high-value future experiment, if ownership is reconsidered

A preregistered blinded Arm A/B comparison of Raw-SQL-Rules-only review versus the same inputs plus a frozen Review Rules candidate would resolve the only material Review Rules decision uncertainty: whether it yields reproducible added value without extra false positives, style noise, or overhead. Existing evidence lacks Arm B. A positive result could justify considering a separate Review Rules product decision; no difference would reinforce non-ownership.

This experiment is not required for 0.1 readiness. Do not start another generic feature dogfood merely to accumulate more evidence; do not change normative Rules in response to the packaging defect, a single evidence gap, or an unresolved business requirement.
