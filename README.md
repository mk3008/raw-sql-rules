# Raw SQL Rules

**Raw SQL, with rules instead of a framework.**

Raw SQL Rules is a small set of natural-language rules for safe, reviewable Raw SQL application development.

- **DBMS-agnostic** — the Rules themselves do not depend on one database product.
- **Language-agnostic** — no programming language is prescribed.
- **Incrementally adoptable** — use the Rules only on the Raw SQL paths of an application that may still use an ORM elsewhere.

Current release: **0.1**. The Rules are evidence-backed, but real-world dogfooding is still limited.

The authoritative contract is [raw-sql-rules.md](raw-sql-rules.md).

## Scope

Raw SQL Rules is a small repository-level contract for AI-assisted Raw SQL development.

It tells coding agents how application Raw SQL should be written, reviewed, and verified without prescribing an application architecture or framework. You can apply it only to the Raw SQL parts of an application and keep using an ORM elsewhere.

## Before you start

For the Raw SQL paths where you use the Rules:

- keep application SQL in `.sql` files;
- keep current DDL in the repository;
- use the database's native driver;
- have a way to verify important behavior against the real database.

You do not need to convert the whole application.

## Add Raw SQL Rules

There is no runtime package. Setup is just two small repository changes.

### Manual

1. Copy [`raw-sql-rules.md`](raw-sql-rules.md) to `rules/raw-sql-rules.md`.
2. Add this block to the root `AGENTS.md`:

```md
<!-- raw-sql-rules:start -->
## Raw SQL

Before changing or reviewing a Raw SQL data-access path, read `rules/raw-sql-rules.md`.
Follow it as the repository contract for Raw SQL work.
Before merge, run a fresh review of Raw SQL data-access changes against the requirements, canonical DDL, and these Rules.
<!-- raw-sql-rules:end -->
```

That's it.

### Installer

The installer performs the same setup automatically.

From a POSIX shell:

```sh
gh api repos/mk3008/raw-sql-rules/contents/install.sh \
  -H 'Accept: application/vnd.github.raw+json' |
  sh
```

From PowerShell 7+ on Windows:

```powershell
$ref = 'main'
$env:RAW_SQL_RULES_REF = $ref
gh api "repos/mk3008/raw-sql-rules/contents/install.ps1?ref=$ref" `
  -H 'Accept: application/vnd.github.raw+json' |
  Out-String |
  ForEach-Object { & ([scriptblock]::Create($_)) }
```

Both installers require an authenticated GitHub CLI (`gh`). Re-running the installer updates the same managed `AGENTS.md` block instead of duplicating it.

Optional paths and refs can be changed with `RAW_SQL_RULES_REF`, `RAW_SQL_RULES_PATH`, and `AGENTS_FILE`.

## Why these Rules?

These Rules were not assembled from a list of preferred practices. They emerged from a larger project for safe application Raw SQL through repeated implementation, comparison, failure, and removal of mechanisms that did not justify permanent ownership.

See [RATIONALE.md](RATIONALE.md) for that research history and the evidence behind each Rule.

## Learn more

- [raw-sql-rules.md](raw-sql-rules.md) — the normative contract
- [RATIONALE.md](RATIONALE.md) — why these Rules exist and how they were validated
- [EVIDENCE.md](EVIDENCE.md) — evidence, provenance, and known limits
- [examples/mysql2](examples/mysql2) — one non-normative real-database example
