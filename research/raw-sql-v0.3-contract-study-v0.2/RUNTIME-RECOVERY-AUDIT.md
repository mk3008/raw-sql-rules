# Runtime Recovery Audit

## Scope

This audit compares the normal host terminal with the child process that
`launch.mjs` actually starts. It records only executable paths, versions, paths,
and redacted setting presence. It does not copy, display, or modify credentials.

## Observed launch paths

| Surface | Executable resolution | Version | Auth status at observation |
| --- | --- | --- | --- |
| Host PowerShell command | `C:\Users\mssgm\AppData\Roaming\npm\codex.ps1` / `codex.cmd` | 0.144.4 | `Logged in using ChatGPT` |
| Runner Node child | `spawn('codex', ..., { shell: false })` resolves `codex.exe` | 0.153.3 | effective model transport verified below |

The runner starts `codex exec --ephemeral --json -m gpt-5.6-terra -c
model_reasoning_effort="medium" --approve-for-me -C <candidate> <prompt>` with
the candidate as both process cwd and `-C` target. Its child environment is a copy
of the process environment plus `CANDIDATE_ROOT`; it removes only Git-discovery
variables and `NODE_PATH`. It does not remove `CODEX_HOME`, authentication,
proxy, or CA variables.

The effective host and Node child run as the same Windows user SID. At observation,
`CODEX_HOME`, proxy variables, and CA override variables were unset rather than
explicitly stripped. `codex login status` had a transient inconsistent result in
the Node child during the original failure investigation; a subsequent same-user,
same-environment check succeeded. No auth store was copied, moved, or changed.

## Authentication and TLS are separate

- **Authentication:** direct `login status` is currently successful for both the
  host CLI and the Node child. The actual proof relevant to the study is the r2
  model response below, not status output alone.
- **TLS:** the interrupted run recorded `UnknownIssuer`; no CA, proxy, OS trust
  store, CLI installation, provider, or model configuration was changed. The cause
  of the earlier transient TLS failure is therefore unknown. It is not attributed
  to Schannel success or to authentication.

## Actual runner-equivalent communication preflight

`transport-preflight.mjs` uses `safeEnvironment`, `spawn('codex', ..., shell:
false)`, a fresh OS-temp Git repository, the same model, reasoning effort,
`--approve-for-me`, `--ephemeral`, and `child.stdin.end()` as the official runner.

- r1 (`evidence/preflight/runner-transport-probe/`) is an invalid harness attempt:
  it omitted `child.stdin.end()` and timed out while the CLI awaited stdin. It did
  not start a model turn and is preserved as diagnostic evidence.
- r2 (`evidence/preflight/runner-transport-probe-r2/result.json`) PASSed with
  `codex-cli 0.153.3`, a completed turn, and exact model response
  `RUNNER_TRANSPORT_OK`.

No existing supported authentication or trust setting was referenced by mistake,
so `launch.mjs` and `isolation.mjs` are unchanged. The preflight harness is a
reversible research-infrastructure addition; deleting it and its preflight
evidence restores the pre-amendment runner surface without affecting an official
candidate result.
