# Raw SQL Rules v0.3.0 release notes (draft)

> This is a release-note draft. v0.3.0 is not tagged or published until this
> change is reviewed, merged, tagged, and released from the resulting commit.

## What changed

- The normative text is organized as **Scope**, one **Safety Contract**, and
  four author **Default Requirements**.
- Scope now directly states both the selected Raw SQL representation and that
  connection/pool, transaction, retry, logging, mapping, migration, testing,
  deployment, and architecture choices remain application-owned.
- Default 1 now requires one authoritative, directly reviewable SQL definition
  that is locatable from execution sites, while allowing either dedicated or
  operation-colocated placement. Dedicated sources remain a valid choice for
  inventory, long SQL, SQL-only review, or cross-operation reuse.
- Default 2 now requires meaningful named parameter definitions in the
  authoritative SQL and caller bindings by those names.
- Default 4 now states the verification boundary as the target database engine
  plus selected driver. An isolated or disposable test database is sufficient;
  production access or production data is not required.

## Default 2 migration note

Comments beside `$1`, CTE aliases over `$1`, or aliases such as `$1 AS
tenant_id` do not meet v0.3 Default 2 when a caller still manually maintains a
positional value array. If a selected driver requires positional or anonymous
binding, derive that representation and its values mechanically from the named
authoritative SQL. Keep values bound rather than embedding them into SQL syntax.

No particular marker syntax, DBMS, driver, library, or package is required.
This release does not revive, move, or add a generic named-parameter package.

## Evidence and limits

The Safety Contract's quality-improvement effect was not established by the
v0.3 research. The frozen release acceptance records the bounded
C#/Npgsql/PostgreSQL and Node/node-postgres/PostgreSQL configurations against an
earlier v0.3 draft. It predates the placement-neutral Default 1 wording and the
Default 4 production-access clarification; those changes are not retroactively
claimed as exact-text acceptance results. The Default 1 decision instead relies
on the bounded placement assessment recorded in
`research/default-1-v0.3-decision.md`, which does not establish a universal
layout preference or measured review-quality improvement.

## Publishing after merge

After review and merge, create the `v0.3.0` tag at the approved merge commit,
verify the tagged `raw-sql-rules.md` hash against `EVIDENCE.md`, then create the
GitHub Release using these notes. Do not tag or publish from this branch.
