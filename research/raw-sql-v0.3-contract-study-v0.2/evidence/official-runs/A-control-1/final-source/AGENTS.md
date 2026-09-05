# Raw SQL task context

## Scope

These Rules apply to application paths where Raw SQL is the selected query
representation.

## Default Requirements

Each executable application SQL statement has one dedicated authoritative
reviewable source. Parameters are named by meaning at the human SQL review
surface. Current relevant schema is directly inspectable. DB/driver-dependent
behavior has a path to verification through the target database engine and
selected driver.
