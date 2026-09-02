# Standalone benchmark host runner

Run from ordinary signed-in Windows PowerShell, not from a parent Codex agent:

```powershell
& .\benchmark\harness\host-runner\Invoke-BenchmarkHost.ps1 -Cycles 3
```

The explicit runtime root is configured in `host-runner-profile.json`. It is separate from candidate repositories and records all host evidence. The runner consumes the existing candidate launcher and candidate runtime profile unchanged. This is infrastructure qualification only; it does not implement a study.
