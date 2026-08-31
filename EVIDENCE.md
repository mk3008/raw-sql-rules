# Evidence and provenance

## Origin

This standalone artifact is derived from prior Ashiba research, but standalone
use has no Ashiba runtime, configuration, CLI, or package dependency.

For the reasoning behind each Rule and direct links to the underlying studies,
see [RATIONALE.md](RATIONALE.md).

## Normative revision

- Raw SQL Rules v6
- SHA-256: `A0E1F71BFBF4CE664F581757284A08B8C9EB6EB28AE9E953CC38965189AB7375`

## Primary evidence summary

The dedicated Raw SQL Rules work included:

- 20 adversarial scenarios;
- 10 important boundaries, each receiving two independent fresh judgments;
- five goal-driven implementation probes whose actual candidate code was retained;
- a live MySQL 8.4 + mysql2 3.22.3 native-driver lane;
- an inconclusive completion-contract experiment retained rather than rewritten;
- one bootstrap-from-zero validation plus two steady-state reuse changes;
- one final fresh bootstrap and one final fresh steady-state confirmation against
  the v6 wording;
- independent read-only review of the final confirmation;
- no framework, helper, testkit, or mechanical gate required in the evaluated
  scope.

The evaluation intentionally recorded negative evidence. In V3, two fresh
implementation probes stopped at mock-only tests, so the result was downgraded
to `NOT-YET`. Later V5/V6 work isolated the zero-test bootstrap case and
confirmed the final two-state Rule 8 contract instead of hiding those failures.

## Known limits

- Final live evidence primarily covers MySQL/mysql2.
- Agent and task diversity is small.
- PostgreSQL named-parameter adaptation remains a separate concern.
- This is not proof of universal agent compliance.

## Provenance

Research history remains in [mk3008/ashiba PR #114](https://github.com/mk3008/ashiba/pull/114),
merged as `e2211aa2d4048c5b739ba4fc233e898fbb3bad76`. The complete V0-V6
report is [archived in Ashiba](https://github.com/mk3008/ashiba/blob/main/packages/raw-sql-rules/EVALUATION_REPORT.md).
Those links are provenance/evidence only; `RULES.md` is independently usable
here.
