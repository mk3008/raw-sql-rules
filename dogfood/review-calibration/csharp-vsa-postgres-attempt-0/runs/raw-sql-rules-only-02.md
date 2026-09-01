# Arm A / Run 2

- Reviewer context: fresh, read-only; model / effort / start-end time:
  `unavailable`.
- Candidate: `30dca66ec9aa4014cc4e7d092f5e2d6c474d6e9f`, history-free archive at
  `C:\tmp\rawsql-review-calibration-attempt-0\run-02`.
- Human intervention: none. First `dotnet test` was sandbox-blocked by a
  NuGet.Config access restriction; an escalated retry passed 5/5.
- Prompt: byte-identical `../prompts/raw-sql-rules-only-review.md`.

## Reviewer output (verbatim)

Files inspected: `AGENTS.md`, installed Rules, Compose, canonical DDL/seed,
application/project/configuration files, loader, both feature slices and SQL,
and all test-project source files. Publish output was inspected under the
isolated snapshot.

Commands run: source inspection; `git status --short` (confirmed no Git
repository); `dotnet test WorkItems.sln` (passed 5/5 after sandbox retry);
`dotnet publish src/WorkItems.Api/WorkItems.Api.csproj -o publish`; launched
the published executable and requested `GET /work-items`.

1. Confirmed defects, with concrete evidence and impact

- Published deployments cannot serve the new endpoints because required SQL
  assets are absent from publish output. `SqlFileLoader` reads from
  `environment.ContentRootPath`; handlers load request-time SQL assets; the
  project does not declare those `.sql` files for publish. Publishing produced
  binaries/config only. Running from `publish` and requesting `GET
  /work-items` failed with `DirectoryNotFoundException` for
  `publish\Features\WorkItems\GetWorkItems\ListWorkItems.CreatedDesc.sql`.
  The feature therefore passes source-tree tests but fails in a normal
  published deployment.

2. Resolvable evidence gaps

- No regression proves upper-bound page-size behavior.
- No regression proves `priority_desc` or default sort when `sort` is omitted.
- Transaction happy path and not-found path are covered, but no database-backed
  event-write failure proves rollback.
- No published-artifact smoke test exists; that absence is directly relevant
  because source-tree DB tests passed while the published app failed.

3. Uncertainties that are not confirmed defects

- Re-completion overwrites `completed_at` and adds another event. It would be
  wrong for an idempotent contract, but repeat semantics are not supplied.
