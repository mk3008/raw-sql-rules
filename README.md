# Raw SQL Rules

Raw SQL Rules is a small natural-language contract for applications that choose
to use Raw SQL directly. Its authoritative contract is [RULES.md](RULES.md).

It is not an ORM, query builder, runtime framework, linter, migration system,
or code generator. Raw SQL is not chosen for unlimited freedom: one visible
representation is easier for humans and AI agents to inspect and constrain.

The core idea is visible SQL + directly inspectable current DDL + bounded
runtime syntax + meaningful parameters + a native driver + database-backed
behavioral evidence.

## Adopt it

Keep or vendor `RULES.md` in the application repository and make it directly
available to the coding agent. Reference it from `AGENTS.md` or contributor
instructions. Do not translate the Rules into a framework or config layer.

If a database-backed regression pattern already exists, follow it and preserve
evidence for changed database behavior. If none exists, Rule 8 describes the
small bootstrap path: canonical DDL -> target database -> native driver -> real
SQL asset -> meaningful behavior/runtime assertion -> one repeatable command.
That first example supplies the How for later agents; it is not broad testing
infrastructure or exhaustive coverage.

## Example

[examples/mysql2](examples/mysql2) is one non-normative evaluated MySQL/mysql2
implementation example. It is not a required directory layout or a requirement
to use MySQL.

## Evidence

See [EVIDENCE.md](EVIDENCE.md) for provenance, evaluated scope, and limits.
The standalone artifact is self-contained.
