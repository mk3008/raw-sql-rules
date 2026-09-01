# Attempt 1 result

Commit: `32a7cc5`.

Observed: maintenance reused the list feature and its SQL/test pattern for `minimumPriority` and finite `title_asc`, without a query builder or abstraction growth. The environment was still unavailable during this attempt's test run.

The subsequent repair commit `f282f60` fixed DB test configuration, UTC normalization, and safe offset arithmetic; its DB-backed suite passed 9/9.
