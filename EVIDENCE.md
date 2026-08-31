# Evidence and provenance

## Origin

This standalone artifact is derived from prior Ashiba research, but standalone
use has no Ashiba runtime, configuration, CLI, or package dependency.

## Normative revision

- Raw SQL Rules v6
- SHA-256: `A0E1F71BFBF4CE664F581757284A08B8C9EB6EB28AE9E953CC38965189AB7375`

## Primary evidence summary

- adversarial natural-language boundary evaluation;
- goal-driven implementation probes;
- MySQL 8.4 plus mysql2 3.22.3 live execution;
- bootstrap-from-zero validation;
- steady-state reuse validation;
- no framework, helper, testkit, or mechanical gate required in the evaluated
  scope.

## Known limits

- Final live evidence primarily covers MySQL/mysql2.
- Agent and task diversity is small.
- PostgreSQL named-parameter adaptation remains a separate concern.
- This is not proof of universal agent compliance.

## Provenance

Research history remains in [mk3008/ashiba PR #114](https://github.com/mk3008/ashiba/pull/114),
merged as `e2211aa2d4048c5b739ba4fc233e898fbb3bad76`. That link is
provenance only; `RULES.md` is independently usable here.
