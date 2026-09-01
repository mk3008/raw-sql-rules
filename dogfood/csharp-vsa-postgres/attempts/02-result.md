# Attempt 2 result

Commit: `50d7fcc`.

Observed: the completed view reused the same VSA/Npgsql/SQL-asset test pattern. Its SQL owns the fixed successful-completion semantics, while owner and timestamp window stay caller parameters. Independent execution passed 12/12 real-PostgreSQL tests.
