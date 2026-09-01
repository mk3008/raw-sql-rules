# Final recovery-branch verification

These checks were run read-only against final recovery head
`2c548691bd32372d481056b768c47aa0cc575b22` before creating this evidence.

```powershell
dotnet test examples/csharp-vsa-postgres/WorkItems.sln --no-restore
dotnet publish examples/csharp-vsa-postgres/src/WorkItems.Api/WorkItems.Api.csproj -o C:\tmp\recovery-pr14-final-verification
```

Observed results:

- PostgreSQL-backed suite: 6 passed, 0 failed.
- Published SQL asset count: 5.
- Published `GET /work-items?sort=created_desc&pageSize=10`: HTTP 200,
  `sort=created_desc`, `pageSize=10`.
- `git diff --check` for recovery base to recovery head: pass.

No new candidate defect was observed during this verification. Candidate source
was not changed as part of this evidence branch.
