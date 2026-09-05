# Raw SQL Rules v0.3.0 release notes (draft)

> This is a release-note draft. v0.3.0 is not tagged or published until this
> change is reviewed, merged, tagged, and released from the resulting commit.

## What changed

- The normative text is organized as **Scope**, one **Safety Contract**, and
  four author **Default Requirements**.
- Scope now directly states both the selected Raw SQL representation and that
  connection/pool, transaction, retry, logging, mapping, migration, testing,
  deployment, and architecture choices remain application-owned.
- Default 2 now requires meaningful named parameter definitions in the
  authoritative SQL and caller bindings by those names.

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
v0.3 research. The release acceptance records the bounded C#/Npgsql/PostgreSQL
and Node/node-postgres/PostgreSQL configurations, their functional and
Default-1–4 results, and any environment limitations separately. It does not
claim a general safety guarantee or a measured improvement rate.

## Publishing after merge

After review and merge, create the `v0.3.0` tag at the approved merge commit,
verify the tagged `raw-sql-rules.md` hash against `EVIDENCE.md`, then create the
GitHub Release using these notes. Do not tag or publish from this branch.
