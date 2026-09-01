# Dedicated Review Rules decision

## Decision: DO NOT ADD to Raw SQL Rules 0.1

The product does not currently own a dedicated Review Rules artifact. This is a decision against addition now, not a claim that such Rules are universally unnecessary.

## Evidence

- PR #12 ran three blinded, fresh, Raw-SQL-Rules-only reviews against the same `.git`-free Attempt 0 snapshot. They produced no false positives or style/noise findings, preserved unspecified repeat-completion semantics as uncertainty in all three runs, consistently identified some evidence gaps, and found a separate runtime-confirmed publish defect in 2/3 runs.
- PR #17/#18 used fresh Raw-SQL-Rules-only reviews in a new feature flow. They found evidence gaps that were actionable as verification strengthening, then re-review reached no confirmed defect.
- Detection stability is still bounded: the PR #12 corpus did not reproduce every historical label, and reviewer runtime evidence was sometimes limited by environment permissions.
- No Arm B review with a frozen Review Rules candidate has been run. Therefore there is no evidence of added value over Raw-SQL-Rules-only review.

## Gate

Permanent ownership would require a preregistered blind Arm A/B comparison on the same frozen candidates or known corpus, measuring confirmed-defect detection, missed known defects, false positives, style noise, actionability, repairability, human intervention, and review overhead.

If that comparison shows no reproducible benefit, retaining Raw-SQL-Rules-only review is the correct result. The comparison is not a 0.1 release blocker and should not be replaced by another generic feature dogfood.
