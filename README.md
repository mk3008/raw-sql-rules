# Raw SQL Rules

**A small contract for application paths that intentionally use Raw SQL.**

Raw SQL Rules defines a durable boundary for directly reviewable SQL without
becoming a framework or prescribing an application's architecture. Current
contract: **v0.3**. The authoritative text is
[raw-sql-rules.md](raw-sql-rules.md).

## What is fixed

The Safety Contract is the non-customizable core: runtime input does not supply
arbitrary SQL syntax. The application retains control of SQL syntax and
structural choices, including reviewed finite structural variation.

## What is customizable

The following are supplied project Default Requirements. They are meaningful
defaults for reviewability, maintenance, and verification, but a project may
customize or omit them without changing the Safety Contract:

1. Executable application SQL has a dedicated reviewable source.
2. Authoritative SQL uses meaningful named parameters and callers bind by name.
3. Current schema is directly inspectable.
4. DB/driver-dependent behavior is verifiable at the real boundary.

## Scope

Raw SQL Rules applies only to application paths where Raw SQL is the selected
query representation, directly visible as ordinary SQL and executed through the
selected driver. It does not prescribe connections, pools, transactions,
retries, logging, result mapping, migrations, testing, deployment, framework,
or architecture. A path covered by these Rules may not be switched to another
query representation merely to evade them.

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

The v0.3 structure separates Scope, a narrow Safety Contract, and author
Default Requirements. Default 2 requires named definitions and named bindings:
comments or CTE aliases around positional parameters alone are not sufficient.
See [RATIONALE.md](RATIONALE.md) for the product reasoning and
[EVIDENCE.md](EVIDENCE.md) for the bounded evidence and its limits.

## Learn more

- [raw-sql-rules.md](raw-sql-rules.md) — normative contract
- [RATIONALE.md](RATIONALE.md) — product rationale
- [EVIDENCE.md](EVIDENCE.md) — evidence and provenance
