# Candidate runtime environment harness

This is Windows infrastructure validation, not a Raw SQL Rules benchmark.

Future candidate qualification and future benchmark candidates must use the same `candidate-runtime-profile.json` and `Invoke-CandidateTurn` entry point. The entry point resolves the installed native `codex.exe`, constructs arguments through `ProcessStartInfo.ArgumentList`, starts the process with redirected JSONL/stderr streams, and provides bounded wait/kill handling.

Run a normal launch probe:

```powershell
./benchmark/harness/candidate-runtime/Test-CandidateRuntime.ps1 -Mode simple
```

Run the candidate-owned Docker/PostgreSQL validation:

```powershell
./benchmark/harness/candidate-runtime/Test-CandidateRuntime.ps1 -Mode docker
```

The Docker mode creates a new temporary one-commit Git repository with no remote. The model turn starts and validates its own uniquely labelled PostgreSQL 16 container, writes a ready marker, waits for the parent acknowledgement, and removes that same container. The parent independently checks the container, label, readiness, table, and exact inserted row before acknowledging. Each run writes JSONL events, final response, parent verification attempts, exit/timeout evidence, and leak checks under `evidence/`.

The profile uses `danger-full-access` plus `approvalPolicy=never`. `workspace-write` was tested first but did not reliably permit access to the Docker client configuration and Windows Docker named pipe. Do not replace this invocation with `Start-Process codex`; see `ENGINEERING-REPORT.md`.
