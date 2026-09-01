# Raw SQL Rules

**Raw SQL, with rules instead of a framework.**

Raw SQL Rules is a small set of natural-language rules for safe, reviewable Raw SQL application development.

- **DBMS-agnostic** — the Rules themselves do not depend on one database product.
- **Language-agnostic** — no programming language is prescribed.
- **Incrementally adoptable** — use the Rules only on the Raw SQL paths of an application that may still use an ORM elsewhere.

Current release: **0.1**. The Rules are evidence-backed, but real-world dogfooding is still limited.

The authoritative contract is [raw-sql-rules.md](raw-sql-rules.md).

## Scope

Raw SQL Rules is an instruction harness for AI-assisted Raw SQL work. Its job is to improve first-pass implementation quality and consistency by constraining the agent's starting choices.

The Rules define the implementation and review contract for Raw SQL work; they do not certify the code an agent produces. Requirements, canonical DDL, and the Rules remain the review authorities. The installer-generated `AGENTS.md` block triggers a fresh review of Raw SQL data-access changes before merge, without prescribing a dedicated Review Rules methodology.

Bounded application search with many optional inputs remains in scope when the application owns the finite query shape. The boundary is an open-ended user-defined query language — arbitrary predicate trees, join graphs, projections, aggregates, or grouping dimensions — not the number of search fields.

## Install

From the root of your application repository:

```sh
gh api repos/mk3008/raw-sql-rules/contents/install.sh \
  -H 'Accept: application/vnd.github.raw+json' |
  sh
```

From PowerShell 7+ on Windows (verified with PowerShell 7.6.5; Windows
PowerShell 5.1 is not evaluated):

```powershell
$ref = 'main'
$env:RAW_SQL_RULES_REF = $ref
gh api "repos/mk3008/raw-sql-rules/contents/install.ps1?ref=$ref" `
  -H 'Accept: application/vnd.github.raw+json' |
  Out-String |
  ForEach-Object { & ([scriptblock]::Create($_)) }
```

Both installers require the GitHub CLI (`gh`) to be authenticated. They accept
the same optional environment overrides: `RAW_SQL_RULES_REF`,
`RAW_SQL_RULES_PATH`, and `AGENTS_FILE`.

The installer copies the Rules to `rules/raw-sql-rules.md` and adds a small managed block to the root `AGENTS.md` telling the coding agent to read that local file before changing or reviewing Raw SQL data access and to run a fresh pre-merge review against the requirements, canonical DDL, and Rules. Re-running it updates the same block instead of duplicating it.

## Why these Rules?

These Rules were not assembled from a list of preferred practices. They emerged from a larger project for safe application Raw SQL through repeated implementation, comparison, failure, and removal of mechanisms that did not justify permanent ownership.

See [RATIONALE.md](RATIONALE.md) for that research history and the evidence behind each Rule.

## Learn more

- [raw-sql-rules.md](raw-sql-rules.md) — the normative contract
- [RATIONALE.md](RATIONALE.md) — why these Rules exist and how they were validated
- [EVIDENCE.md](EVIDENCE.md) — evidence, provenance, and known limits
- [examples/mysql2](examples/mysql2) — one non-normative real-database example
