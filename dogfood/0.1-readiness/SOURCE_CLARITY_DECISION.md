# Source Clarity Rules decision

## Decision: KEEP AS UNPROVEN HYPOTHESIS

Do not add Source Clarity Rules to the product now, and do not drop the question as disproved.

## Evidence

- Rule 6 already asks for comments only where business intent, correctness/concurrency/locking, or performance is non-obvious.
- PR #12's three generic Raw-SQL-Rules-only reviews did not spontaneously identify `status = 2`, query-owned constants, parameter/literal ownership, comments, WHY/WHY NOT, or query-stage readability.
- PR #17/#18 similarly had no natural source-clarity findings.

Those observations neither show that source clarity is unimportant nor establish that an additional Rule would improve outcomes. No controlled comparison has supplied a frozen Source Clarity candidate, a corpus of independently adjudicated readability failures, or a measurable benefit that outweighs comment/style noise.

## Gate

Only run a targeted comparison if a concrete decision depends on it: use the same frozen SQL corpus with and without a candidate clarity artifact, score useful understanding/correctness findings and noise, and decide whether results justify ownership. Do not turn a human preference for more comments, or the absence of a generic-review comment, into normative text.
