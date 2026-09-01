# SQL Source Clarity Rules beta

Experimental only; not part of Raw SQL Rules.

A SQL asset should remain meaningful when read alone. The caller should not own semantics that naturally belong to the query.

- Comments explain non-obvious business intent, correctness/concurrency assumptions, performance choices, or intentionally rejected alternatives; do not narrate obvious syntax.
- Parameters represent genuine caller-selected runtime variability.
- A value fixed for every valid execution is query-owned; avoid fake generic parameters.
- For non-trivial SQL, assess semantic-stage comments without forcing comments on trivial SQL.
- Report absent cases as `not exercised`; do not manufacture findings.
