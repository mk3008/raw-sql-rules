# Post-hoc verifier plan

This analysis was designed after ChatGPT review of the frozen Primary results.
It is not preregistered, does not alter `evaluator/run.mjs`, and is reported
separately from the 20 Primary PASS observations.

The verifier checks only frozen task requirements that the coherence audit
identified but the frozen evaluator did not cover: B's tenant-b success-array
and remaining finite statuses, and D's detailed projection plus both-tenant
coverage.  It also checks duplicate finite inputs where the task says exactly
one.  It does not add a business requirement or a general quality criterion.

Before applying it to preserved final sources, it must pass a known-good
implementation and fail two purpose-built variants: B returns HTTP 500 or a
non-array for tenant-b; D returns cross-tenant/incomplete detailed rows.
Candidate files, events, original `evaluation.json`, and original frozen
results are read-only inputs.  Docker evaluator execution is not candidate
behavior.
