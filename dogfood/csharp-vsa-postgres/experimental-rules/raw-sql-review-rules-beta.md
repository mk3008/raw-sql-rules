# Raw SQL Review Rules beta

Experimental only; not part of Raw SQL Rules.

- Review the candidate; do not silently redesign it. Do not modify source.
- Requirements are authority for requested behavior; canonical DDL is authority for current structure.
- Review application SQL directly. Target DB and native-driver behavior outrank static assumptions. A candidate's own test claim is insufficient evidence.
- Prioritize correctness, safety, SQL semantics, cardinality, null behavior, transaction/concurrency behavior, runtime mappings, and missing behavioral evidence.
- Separate confirmed defects from uncertainty and avoid style noise.
- Every finding states severity, concrete evidence, impact, and a verification route.
