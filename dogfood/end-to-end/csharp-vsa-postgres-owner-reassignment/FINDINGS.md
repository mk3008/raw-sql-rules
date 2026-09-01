# Finding ledger

PR review threads are the primary records; this ledger links their terminal dispositions rather than reproducing their full text.

| ID | Classification and disposition | Action | Final status |
| --- | --- | --- | --- |
| E1 | Resolvable evidence gap: persisted `owner_changed.occurred_at` was not directly proved against one operation timestamp. | Verification strengthening `41b7b2f`; fixed `TimeProvider` and real-PostgreSQL assertion. [Thread](https://github.com/mk3008/raw-sql-rules/pull/17#discussion_r3902046859) | Resolved; targeted verification 2/2 passed. |
| E2 | Resolvable evidence gap: initial-state no-op did not prove A -> B -> B suppresses a second event. | Verification strengthening `4a0b44f`; real-PostgreSQL regression. [Thread](https://github.com/mk3008/raw-sql-rules/pull/17#discussion_r3902047011) | Resolved; targeted verification 3/3 passed. |
| U1 | Requirement ambiguity: the requirements do not define arbitrary-working-directory launch support for the published binary. | No code change. Publish-directory launch was verified; the broader launch contract was retained as an accepted limit. [PR record](https://github.com/mk3008/raw-sql-rules/pull/17#issuecomment-5491042142) | Resolved as accepted uncertainty. |
| E3 | Resolvable evidence gap: transaction rollback after event-insert failure had only code-reading support. | Verification strengthening `c71d8eb3cb44834010ddb4e70cadbfb1bed29d2c`; PostgreSQL constraint-induced insert failure proves owner rollback. [Thread](https://github.com/mk3008/raw-sql-rules/pull/17#discussion_r3902221778) | Resolved; targeted test 1/1 and full suite 21/21 passed. |
| E4 | Reviewer-environment evidence gap: isolated final reviewer could not obtain runtime proof. | No candidate change. Current-head verification supplied test, publish, asset, and HTTP evidence. [PR record](https://github.com/mk3008/raw-sql-rules/pull/17#issuecomment-5491309941) | Closed by independent verification. |

No review finding was treated as automatic authority. E1, E2, and E3 were adjudicated before their evidence-only actions; U1 was not converted into invented runtime semantics.
