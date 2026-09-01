# Claims boundary

## Supported observations

| Area | Observed | Bounded inference |
| --- | --- | --- |
| C# application path | PR #10 and PR #17 exercised C# / ASP.NET Core / PostgreSQL / VSA with native Npgsql and external SQL assets, real PostgreSQL tests, and published-runtime checks. | The current Rules coexist with this tested scenario without requiring an ORM, query builder, repository layer, or framework. |
| Installer | PR #8 observed the Windows POSIX portability failure. PR #9 added and verified a native installer; PR #10 exercised installer-generated discovery. | PowerShell 7+ is a supported/tested installation path for the observed Windows environment. |
| Raw-SQL-Rules-only review | PR #12 had 3 fresh blinded reviews; PR #17 had fresh review/re-review without dedicated Review or Source Clarity Rules. | Raw-SQL-Rules-only review can produce actionable evidence gaps and can preserve explicit contract ambiguity in the tested cases. |
| Recovery | PR #14/#15 replayed supplied findings; PR #17/#18 connected fresh detection, adjudication, verification strengthening, re-review, and convergence. | Verification can operate as an active recovery mechanism in the tested process. |

## Unsupported generalizations

Do not claim universal language or DBMS independence, perfect first-pass generation, perfect defect detection, universal zero human blockers, universal irrelevance of dedicated Review Rules, arbitrary working-directory launch support, Windows PowerShell 5.1 support, or support for all deployment styles.

The owner-reassignment run is one connected case, not evidence of completely uninterrupted orchestration: its containment record includes a stopped misrouting event with no candidate mutation.
