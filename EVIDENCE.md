# Evidence and provenance

## Origin

This standalone artifact is derived from prior Ashiba research, but standalone use has no Ashiba runtime, configuration, CLI, or package dependency.

For the reasoning behind each Rule and direct links to the underlying studies, see [RATIONALE.md](RATIONALE.md).

## Release and normative revision

- Standalone release: **0.1**
- Validated Raw SQL Rules research revision: **v6**
- `raw-sql-rules.md` SHA-256: `A0E1F71BFBF4CE664F581757284A08B8C9EB6EB28AE9E953CC38965189AB7375`

The standalone release number describes product maturity. The v6 label records the research revision that produced the current normative text.

## Primary evidence summary

The dedicated Raw SQL Rules work included:

- 20 adversarial scenarios;
- 10 important boundaries, each receiving two independent fresh judgments;
- five goal-driven implementation probes whose actual candidate code was retained;
- a live MySQL 8.4 + mysql2 3.22.3 native-driver lane;
- an inconclusive completion-contract experiment retained rather than rewritten;
- one bootstrap-from-zero validation plus two steady-state reuse changes;
- one final fresh bootstrap and one final fresh steady-state confirmation against the v6 wording;
- independent read-only review of the final confirmation;
- no framework, helper, testkit, or mechanical gate required in the evaluated scope.

The evaluation intentionally recorded negative evidence. In V3, two fresh implementation probes stopped at mock-only tests, so the result was downgraded to `NOT-YET`. Later V5/V6 work isolated the zero-test bootstrap case and confirmed the final two-state Rule 8 contract instead of hiding those failures.

## Standalone repository dogfood

The standalone repository adds bounded product evidence without replacing the
Ashiba-derived V0-V6 provenance above:

- A Windows PowerShell portability failure was observed in [PR #8](https://github.com/mk3008/raw-sql-rules/pull/8); a native PowerShell 7+ installer was then added and verified, and exercised by the [clean primary C# / ASP.NET Core / PostgreSQL / VSA dogfood](dogfood/csharp-vsa-postgres/).
- A [Raw-SQL-Rules-only blind review calibration](dogfood/review-calibration/csharp-vsa-postgres-attempt-0/) measured fresh review behavior without dedicated Review Rules.
- A [recovery/adjudication calibration](dogfood/recovery-calibration/csharp-vsa-postgres-attempt-0/) preserved separate repair and verification-strengthening outcomes.
- One [owner-reassignment end-to-end run](dogfood/end-to-end/csharp-vsa-postgres-owner-reassignment/) connected fresh review, adjudication, verification strengthening, re-review, and convergence.
- The [0.1 readiness assessment](dogfood/0.1-readiness/) concluded `KEEP-AS-IS`: confirmed repeated Raw SQL implementation-contract gaps were `0`; dedicated Review Rules were not adopted; and Source Clarity remains unproven.

## Known limits

- Evidence includes MySQL/mysql2 research and bounded C# / ASP.NET Core / PostgreSQL dogfood; language and DBMS universality are not proven.
- Agent and task diversity remains small.
- PostgreSQL named-parameter adaptation remains a separate concern.
- PowerShell 7+ is tested; Windows PowerShell 5.1 is not evaluated.
- Review detection is not perfect, and no dedicated Review Rules Arm B comparison has been run.
- The one connected end-to-end run included a contained orchestration misrouting event; it is not evidence of fully uninterrupted autonomous development.
- This is not proof of universal agent compliance, universal zero human blockers, or universal irrelevance of dedicated Review Rules.

## Provenance

Research history remains in [mk3008/ashiba PR #114](https://github.com/mk3008/ashiba/pull/114), merged as `e2211aa2d4048c5b739ba4fc233e898fbb3bad76`. The complete V0-V6 report is [archived in Ashiba](https://github.com/mk3008/ashiba/blob/main/packages/raw-sql-rules/EVALUATION_REPORT.md).

Those links are provenance/evidence only; [raw-sql-rules.md](raw-sql-rules.md) is independently usable here.
