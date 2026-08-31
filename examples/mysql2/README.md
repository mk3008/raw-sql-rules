# mysql2/MySQL example (non-normative)

This is one evaluated implementation example, not a framework or mandatory layout.
It uses ordinary SQL files, table-local canonical DDL, and mysql2 native named parameters.

Start a disposable MySQL 8.4 database in one terminal:

```sh
docker run --rm --name raw-sql-rules-mysql -e MYSQL_DATABASE=raw_sql_rules -e MYSQL_USER=raw_sql_rules -e MYSQL_PASSWORD=raw_sql_rules -e MYSQL_ROOT_PASSWORD=raw_sql_rules_root -p 33306:3306 mysql:8.4
```

In another terminal, after MySQL is ready, run `npm install`, then `npm run regression`. The script applies only this
example's canonical DDL, executes the real SQL asset through mysql2, checks
representative values and runtime representations, then rolls its data back.
No migration history is required.
