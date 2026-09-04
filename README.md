# Raw SQL Rules

**A small contract for application paths that intentionally use Raw SQL.**

Raw SQL Rules defines a durable boundary for directly reviewable SQL without
becoming a framework or prescribing an application's architecture. Current
contract: **v0.2**. The authoritative text is
[raw-sql-rules.md](raw-sql-rules.md).

## What is fixed

The three Contracts are the non-customizable core of Raw SQL Rules. Changing
one changes the core contract:

1. Raw SQL is the selected query representation.
2. Application concerns remain application-owned.
3. Runtime input does not supply arbitrary SQL syntax.

## What is customizable

The following are supplied project Default Requirements. They are meaningful
defaults for reviewability, maintenance, and verification, but a project may
customize or omit them without changing the three Contracts:

1. Executable application SQL has a dedicated reviewable source.
2. Parameters are named by meaning at the human review surface.
3. Current schema is directly inspectable.
4. DB/driver-dependent behavior is verifiable at the real boundary.

## Scope

Raw SQL Rules applies only to application paths where Raw SQL is the selected
query representation. It makes no claim that Raw SQL is superior to an ORM or
query builder, and it does not require a mixed application to use Raw SQL for
all data access.

## Add Raw SQL Rules

There is no runtime package. Copy
[raw-sql-rules.md](raw-sql-rules.md) to `rules/raw-sql-rules.md`, then add this
managed block to the root `AGENTS.md`:

```md
<!-- raw-sql-rules:start -->
## Raw SQL

For Raw SQL data-access work, read `rules/raw-sql-rules.md` and follow it
as the repository contract.
<!-- raw-sql-rules:end -->
```

### Installer

The installers make the same two changes and update the existing managed block
without duplicating it. They require an authenticated GitHub CLI (`gh`).

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

Optional paths and refs are controlled by `RAW_SQL_RULES_REF`,
`RAW_SQL_RULES_PATH`, and `AGENTS_FILE`.

## Why

The v0.2 structure separates durable product boundaries from removable
agent-operational/HOW guidance. See [RATIONALE.md](RATIONALE.md) for the
product reasoning and [EVIDENCE.md](EVIDENCE.md) for the bounded research and
its limits.

## Learn more

- [raw-sql-rules.md](raw-sql-rules.md) — normative contract
- [RATIONALE.md](RATIONALE.md) — product rationale
- [EVIDENCE.md](EVIDENCE.md) — evidence and provenance
