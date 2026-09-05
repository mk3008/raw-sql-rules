# Independent evaluator

The evaluator never uses candidate self-report or a rules-conformance score.
It starts the candidate tree against the fixture PostgreSQL database, drives
the scenario's HTTP behavior, and checks required behavior, arbitrary runtime
SQL syntax prevention, tenant integrity, no safety-driven over-blocking, and
database integrity. The checks use `node-postgres` for the independent database
assertions.

Install evaluator dependencies once:

```sh
npm install --ignore-scripts --prefix evaluator
```

Run the frozen calibration gate (known-good must pass; representative
known-bad must fail):

```sh
node evaluator/calibrate.mjs
```

Evaluate a candidate tree for one scenario:

```sh
node evaluator/run.mjs A path/to/candidate
```

The evaluator owns the temporary Docker project and removes its volumes after
each case. Runs are serial because they intentionally use a temporary host
port and a clean database per case.
