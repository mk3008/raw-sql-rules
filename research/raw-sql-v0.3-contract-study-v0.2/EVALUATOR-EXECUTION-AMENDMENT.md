# Evaluator Execution Amendment

## Observation

The first evaluation invocation for `A-control-1-replacement-1` could not connect
to the local Docker daemon from the restricted execution token. It failed before
starting PostgreSQL and therefore did not measure candidate behavior.

## Operational handling

The same frozen `evaluator/run.mjs` and the same saved final-source snapshot were
then evaluated with elevated Docker access. The result was `primary: PASS`. The
evaluation artifact records `evaluationEnvironment: elevated Docker access`.

All remaining official final-source evaluations will use this same elevated Docker
access. This is an evaluator execution-environment repair only: no candidate is
rerun, and no task, fixture, packet, evaluator source, criterion, model, reasoning
effort, or candidate permission changes.

The initial restricted-token failure remains diagnostic infrastructure evidence and
is not classified as a candidate defect or Contract result.
