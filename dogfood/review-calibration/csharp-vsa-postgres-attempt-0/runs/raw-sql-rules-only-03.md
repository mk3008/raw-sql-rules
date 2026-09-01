# Arm A / Run 3

- Reviewer context: fresh, read-only; model / effort / start-end time:
  `unavailable`.
- Candidate: `30dca66ec9aa4014cc4e7d092f5e2d6c474d6e9f`, history-free archive at
  `C:\tmp\rawsql-review-calibration-attempt-0\run-03`.
- Human intervention: none. Sandbox denied NuGet.Config access for one test
  invocation; `--no-restore` exited 0 but without useful output.
- Prompt: byte-identical `../prompts/raw-sql-rules-only-review.md`.

## Reviewer output (verbatim)

Files inspected: `AGENTS.md`, installed Rules, canonical DDL/seed, Compose,
application/project/loader files, both feature slices and SQL assets, and all
test-project source. Published output was written outside the snapshot and
inspected.

Commands run: source inspection and searches; `dotnet publish` with external
intermediate/output paths; published executable on localhost; HTTP GET and
POST endpoint requests; two `dotnet test` invocations.

1. confirmed defects

- Published runtime is broken for both endpoints: request-time SQL loads from
  `ContentRootPath`, but the project does not copy `.sql` assets to publish
  output. Publish output contained no SQL assets. From that output,
  `GET /work-items` and `POST /work-items/{id}/complete` both returned HTTP
  500 with `DirectoryNotFoundException` for their respective SQL assets.
  The feature is not deliverable outside source-tree layout.

2. resolvable evidence gaps

- Test execution in this isolated environment did not yield trustworthy
  observable output because of NuGet.Config sandbox access.
- No executed proof was found for `priority_desc`, default `created_desc`,
  page-size capping, or inverted `createdFrom`/`createdTo` validation.

3. uncertainties

- Repeat completion behavior is unspecified. The snapshot updates each time
  and inserts another completion event, which would be wrong only if an
  idempotent contract were intended.
