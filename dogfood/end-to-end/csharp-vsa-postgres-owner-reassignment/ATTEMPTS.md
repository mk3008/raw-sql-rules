# Attempts

## Attempt 0

- Frozen candidate SHA: `9afef8c921c40dcd6ddb7fda9427c280a930a403`.
- Application PR: [#17](https://github.com/mk3008/raw-sql-rules/pull/17).
- Scope: a feature-oriented `ReassignWorkItemOwner` slice, endpoint mapping, three SQL assets, and real-PostgreSQL regression coverage.
- Candidate verification: 18 tests passed; publish succeeded; a published application returned `204` for a representative reassignment.

The candidate was frozen before the first review. Its source was not rewritten or squashed before review.

## Recovery sequence

- `41b7b2f`: verification strengthening for persisted operation timestamp.
- `4a0b44f`: verification strengthening for the A -> B -> B no-op boundary.
- `c71d8eb3cb44834010ddb4e70cadbfb1bed29d2c`: verification strengthening for transaction rollback when event insertion fails.

All three recovery commits strengthened evidence only; none changed the endpoint's specified product behavior.
