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

1. Executable application SQL has one authoritative reviewable source.
2. Authoritative SQL uses meaningful named parameters and callers bind by name.
3. Current schema is directly inspectable.
4. DB/driver-dependent behavior is verifiable with the target DB engine and driver.

## Scope

Raw SQL Rules applies to application paths where Raw SQL is the selected query
representation. For covered paths, application data access is expressed as
directly reviewable ordinary SQL and executed through the selected database
driver.

Connections and pools, transactions, retries, logging, result mapping,
migrations, tests, deployment and execution integration, and business semantics
remain application-owned. Application architecture and framework remain
application choices.

## Use Raw SQL Rules

There is no runtime package or installer. Copy the version of
[raw-sql-rules.md](raw-sql-rules.md) you want to adopt into your repository, for
example as `rules/raw-sql-rules.md`.

Tagged GitHub Releases attach `raw-sql-rules.md` as the project distribution
asset. README, rationale, evidence, research, examples, and other repository
material remain reference material in the tagged repository and are not part of
the adopted Rules payload.

### Use with AI agents

Copy this into the repository's root `AGENTS.md` (or equivalent instruction
file), adjusting the path if needed:

```text
For Raw SQL data-access work, read `rules/raw-sql-rules.md` and follow it as the
repository contract.
```

Then keep individual prompts focused on the actual task; they do not need to
mention Raw SQL Rules each time.

## Why

The v0.3 structure separates Scope, a narrow Safety Contract, and author
Default Requirements. Default 1 protects one authoritative, directly reviewable
SQL definition without requiring dedicated-file placement. Default 2 requires
named definitions and named bindings: comments or CTE aliases around positional
parameters alone are not sufficient. Default 4 requires a path through the
target DB engine and driver; an isolated or disposable test database is enough,
and production access or production data is not required. See
[RATIONALE.md](RATIONALE.md) for the product reasoning and
[EVIDENCE.md](EVIDENCE.md) for the bounded evidence and its limits.

## Learn more

- [raw-sql-rules.md](raw-sql-rules.md) — normative contract
- [RATIONALE.md](RATIONALE.md) — product rationale
- [EVIDENCE.md](EVIDENCE.md) — evidence and provenance
