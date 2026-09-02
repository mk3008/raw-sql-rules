# Candidate runtime environment validation

## Scope and status

This engineering work validates a reusable Windows candidate runtime. It is not a benchmark study and does not make a Raw SQL Rules product claim.

## Confirmed Windows launcher root cause

The v0.4 launcher used `Start-Process -FilePath codex`. On this machine, PowerShell resolves `codex` to `C:\Users\mssgm\AppData\Roaming\npm\codex.ps1`, an `ExternalScript`. `Start-Process` attempted to create a Win32 process from that `.ps1` path, which causes `%1 は有効な Win32 アプリケーションではありません。`

This was established by the saved command-resolution diagnostics, not inferred from a presumed shim type. `Get-Command codex -All` also found `codex.cmd`, an extensionless npm shim, and the native executable `C:\Users\mssgm\AppData\Local\OpenAI\Codex\bin\b99306303521e97e\codex.exe`. Direct `codex --version` reported `codex-cli 0.144.4`; the direct noninteractive `codex exec --help` probe exited 0.

The shared launcher selects the native `.exe` mechanically from `Get-Command codex -All`, records the resolved path/type/arguments in every result, and uses `ProcessStartInfo.ArgumentList` rather than shell-string construction.

## Selected reusable profile

- Model: `gpt-5.6-terra`
- Reasoning effort: `medium`
- Sandbox: `danger-full-access`
- Approval policy: `never`
- Environment: inherited host environment; ordinary host network and Docker daemon access expected.

`workspace-write` was tested first. Although one engineering turn succeeded, the first frozen-gate cycle later failed when the model's Docker client was denied access to `C:\Users\mssgm\.docker\config.json` and the Windows Docker named pipe. It was therefore rejected as unreliable. `danger-full-access` is the least configuration that remains to be validated for reliable access on this machine.

## Engineering iterations

Two harness-only issues were fixed before freeze: an ambiguous .NET `ContinueWith` overload in initial stdout/stderr capture, and a parent helper parameter named `$Args`, which shadowed PowerShell's automatic argument variable and caused parent Docker inspection commands to lose their arguments. The latter is preserved by the failed parent attempt record under `evidence/docker-f4178ffcf33742068ed07ef90a012750/`. Neither consumed any benchmark candidate.

The successful pre-freeze Docker proof is `evidence/docker-786cf75912cc4b51bd6f64368f4cf5a5/`. Its JSONL records model-run `docker version`, `docker run`, readiness, `psql` table creation/insert/query, marker waiting, and container removal; its parent attempt record independently confirms the matching container, label, PostgreSQL readiness, table, and exact `candidate-created` row before acknowledgement.

## Frozen validation gate

After the final launcher/profile change, the three directories listed in `FINAL-STABILITY-GATE.md` are the required consecutive frozen-profile cycles. Each contains its own random temporary repository metadata, JSONL, final response, parent verification, process result, and teardown checks.
