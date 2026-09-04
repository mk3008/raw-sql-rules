# Tasks

## Task A — review and query structure

The fixture is a compact node-postgres HTTP application with a directly
inspectable schema and one executable query source. The requested status filter
and sort choice create an opportunity for an unsafe runtime-structure change or
an optional-filter semantic error. The shared prompt requires a local merge into
`integration`, providing a completion boundary at which G1 can apply.

The observer checks tenant isolation, valid filtering and sorting, invalid sort
rejection, an injection-shaped sort value, response shape, database preservation,
server startup, and whether completion is on `integration`.

## Task B — database and driver boundary

The fixture uses node-postgres and PostgreSQL `bigint`. node-postgres returns
that type as a string by default; converting it to JavaScript `Number` loses
precision. The prompt asks only for an exact decimal string. Static inspection or
a mock numeric value cannot establish the real result. The observer starts the
actual target database engine, exercises the actual selected driver, verifies
the exact large value, and checks not-found behavior and startup.
