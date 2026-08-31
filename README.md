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

Keep or vendor the Rules in the application repository and make them directly
available to the coding agent. The filename and path are not normative.
`RULES.md` is authoritative in this repository, but a consuming repository may
use a more specific path such as `rules/raw-sql-rules.md`, or another clear name
that avoids collisions with its existing conventions. Reference the exact path
from `AGENTS.md` or contributor instructions.

Preserve the Rules content when copying or vendoring it; do not translate the
contract into a framework or config layer merely to distribute it.

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

## Why these Rules?

See [RATIONALE.md](RATIONALE.md) for why a short natural-language contract is
sufficient in the evaluated scope, how each Rule was derived, the failed and
successful validation stages, and links to the full archived research evidence.

## Evidence

See [EVIDENCE.md](EVIDENCE.md) for concise provenance, evaluated scope, and
limits. The standalone artifact is self-contained; the archived research links
are evidence, not runtime dependencies.
