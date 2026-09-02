# Standalone runner design

`Run-Study.ps1` owns one immutable `rawsql-v05-<guid>` directory below the configured host runner root. Every record is written atomically there; repository files are read-only during execution. The gate sequence is: blob/runtime lock; non-study Terra host qualification; non-study Sol probe; CAL01--11; three fixture qualifications; four arm preparations; serial official slots; mechanical evaluation; opaque Sol review; unblind report.

For each official slot the runner verifies the runtime lock immediately before launch, prepares the arm and writes identity evidence, starts the shared launcher, observes both lifecycle events, then atomically marks the slot consumed. A started slot cannot be retried. A launch without both events produces `PRELAUNCH_INFRA_FAILURE` and stops before consumption. The state document rejects a count above four.

Candidate evidence includes JSONL/stderr/final response, baseline and final source manifests/archives, binary-capable patch, reconstruction evidence, arm identity, and evaluator results. Review packets omit arm identity, run order, Rules files, evaluator outputs, and other candidates. Sol JSON findings are frozen before unblinding and only set adjudication pending.
