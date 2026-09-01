# DOGFOOD_RESULT — C# × VSA × PostgreSQL primary rerun

## Scope and historical handling

This is a clean primary installer/application dogfood run based on current
`main` at `a27871e9d1f8ead99c764eca6b54ee522744dfa5`. It is not a complete
rerun of the original full Q1-Q9 preregistered experiment.

Historical evidence is preserved and not aggregated with this result:

- PR #7: excluded calibration. Its installer conclusion was invalidated by a
  baseline error: it used a pre-installer commit, manually installed Rules,
  and manually strengthened `AGENTS.md`.
- PR #8: closed/unmerged portability finding. It recorded the Windows POSIX
  userland failure; its dogfood evidence is unchanged here.
- PR #9: merged remediation that added the native PowerShell installation
  path. This run exercises that product path; it does not rewrite earlier
  evidence.

## Primary conclusion

**MEETS-WITH-LIMIT.** The current PowerShell 7+ installer, generated
repository-level discovery path, initial implementation, two fresh maintenance
tasks, and final database-backed validation provide primary evidence for this
specific scenario. Limits are listed below and are not converted into claims.

## Evaluation checks for this clean run

These E1-E9 checks describe this run only. They are intentionally not named
Q1-Q9 because their meanings do not match the historical/original
preregistration.

| Check | Result | Evidence classification |
| --- | --- | --- |
| E1 Installer + generated AGENTS discovery | meets | Observed: actual installer twice, byte identity, managed-block idempotence, fresh agent tool-log discovery. |
| E2 Initial Raw SQL implementation | meets | Observed: frozen Attempt 0, independent review, repaired successor, DB tests. |
| E3 VSA retention | meets | Observed: endpoint, behavior, SQL assets, and tests remain feature-local. |
| E4 SQL source clarity and canonical schema | meets | Observed: `.sql` assets and fixture applying canonical DDL. |
| E5 finite reviewed SQL selection | meets | Observed: explicit finite sort-to-asset mapping and tests. |
| E6 parameter binding and filters | meets | Observed: named Npgsql parameters and PostgreSQL coverage. |
| E7 atomic completion behavior | meets-with-limit | Observed: transaction, state-guarded update, event insertion, retry/concurrency tests. Hypothesis not exercised: forced event-insert failure rollback. |
| E8 maintenance 1 | meets | Observed: fresh Attempt 1 preserves patterns and tests. Historical runs excluded from this conclusion. |
| E9 maintenance 2 | meets | Observed: fresh Attempt 2 fixes successful-completion predicate in SQL and tests it. Historical runs excluded from this conclusion. |

## Historical/original preregistration coverage

This is a mapping from the existing clean-run evidence only; it does not
create new evidence or retroactively preregister beta rules.

| Original preregistration question | Coverage in this run |
| --- | --- |
| Q1 installer-generated AGENTS discovery | meets — E1 installer and fresh-agent discovery evidence. |
| Q2 C#/ASP.NET Core/PostgreSQL/VSA architecture neutrality | meets-with-limit — one clean C# / ASP.NET Core / PostgreSQL / VSA scenario. |
| Q3 native driver; no ORM, query builder, or repository abstraction | meets — Npgsql/native SQL assets and feature-local access code observed. |
| Q4 bootstrap-to-real-DB regression path | meets — canonical DDL plus PostgreSQL-backed tests observed. |
| Q5 maintenance reuses SQL/test patterns | meets — fresh Attempts 1 and 2 observed. |
| Q6 bounded search through fixed reviewed SQL | meets — finite list-sort-to-asset mapping observed. |
| Q7 VSA retained | meets — feature-local endpoint, behavior, SQL, and tests observed. |
| Q8 preregistered experimental Raw SQL Review Rules beta | not exercised — no beta rule was preregistered/frozen before Attempt 0. |
| Q9 preregistered SQL Source Clarity Rules beta | not exercised — no beta rule was preregistered/frozen before Attempt 0. |

## Verification observed

- Source and installed Rules SHA-256 both:
  `A0E1F71BFBF4CE664F581757284A08B8C9EB6EB28AE9E953CC38965189AB7375`.
- Installer run two caused no second-run Rules or `AGENTS.md` byte change and
  retained exactly one managed block plus the unrelated VSA guidance.
- Final database-backed suite: 14 passed, 0 failed.
- Minimal live HTTP validation against the PostgreSQL container:
  `GET /work-items?sort=priority_desc&pageSize=10` returned 200;
  `POST /work-items/11111111-1111-1111-1111-111111111111/complete` returned
  204; `GET /work-items/completed` returned 200 with successfully completed
  work items.

## Limits

- The primary evidence is Windows 11 / PowerShell 7.6.5, .NET 9, Npgsql
  10.0.3, and PostgreSQL 18.1 only.
- Windows PowerShell 5.1 is not evaluated or claimed.
- This run does not claim the Rules themselves are universally validated on
  Windows; it verifies the installation/discovery route and this application.
- The final review's unexercised boundary cases remain hypotheses, not defects.
