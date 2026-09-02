# Unattended host runner gate: PASS (3 / 3)

Status: `UNATTENDED_HOST_RUNNER_VALIDATED`.

The three final cycles were run by one ordinary Windows PowerShell host process using `Invoke-BenchmarkHost.ps1`; the process records its own `pwsh` identity and parent PID in each result. The host consumed the existing candidate launcher and profile unchanged. No parent Codex model turn orchestrated a candidate.

The configured, explicit runtime root was created before execution and recorded in every result. Each cycle created a fresh one-commit, no-remote repository; launched Terra/medium; independently verified its uniquely labelled PostgreSQL table and `candidate-created` row; acknowledged the candidate; and verified candidate-owned removal, label leak absence, and host-port release.

| Evidence | Result | Port |
| --- | --- | --- |
| `evidence/final-gate/cycle-1/result.json` | PASS | 50147 |
| `evidence/final-gate/cycle-2/result.json` | PASS | 64701 |
| `evidence/final-gate/cycle-3/result.json` | PASS | 63522 |

The host runner SHA-256 was `cddb38ef4c572adf91faabf955869d4b2ba788c03b40476f20ee7f5d5fa73977`; the unchanged candidate launcher/profile hashes are in `evidence/final-gate/host-runner-summary.json`.

This status is distinct from `CANDIDATE_RUNTIME_VALIDATED`. Together they validate the candidate runtime and the standalone host execution path; neither status starts a benchmark study.
