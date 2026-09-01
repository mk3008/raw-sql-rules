# DOGFOOD_RESULT — C# × VSA × PostgreSQL primary rerun

## Scope and historical handling

This is a clean primary run based on current `main` at
`a27871e9d1f8ead99c764eca6b54ee522744dfa5`.

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

## Questions

| Question | Result | Evidence classification |
| --- | --- | --- |
| Q1 Installer + generated AGENTS discovery | meets | Observed: actual installer twice, byte identity, managed-block idempotence, fresh agent tool-log discovery. |
| Q2 Initial Raw SQL implementation | meets | Observed: frozen Attempt 0, independent review, repaired successor, DB tests. |
| Q3 VSA retention | meets | Observed: endpoint, behavior, SQL assets, and tests remain feature-local. |
| Q4 SQL source clarity and canonical schema | meets | Observed: `.sql` assets and fixture applying canonical DDL. |
| Q5 finite reviewed SQL selection | meets | Observed: explicit finite sort-to-asset mapping and tests. |
| Q6 parameter binding and filters | meets | Observed: named Npgsql parameters and PostgreSQL coverage. |
| Q7 atomic completion behavior | meets-with-limit | Observed: transaction, state-guarded update, event insertion, retry/concurrency tests. Hypothesis not exercised: forced event-insert failure rollback. |
| Q8 maintenance 1 | meets | Observed: fresh Attempt 1 preserves patterns and tests. Historical runs excluded from this conclusion. |
| Q9 maintenance 2 | meets | Observed: fresh Attempt 2 fixes successful-completion predicate in SQL and tests it. Historical runs excluded from this conclusion. |

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
