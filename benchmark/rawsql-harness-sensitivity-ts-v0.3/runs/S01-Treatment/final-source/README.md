# Inventory API

Node HTTP application. `GET /health` returns 200. Connection configuration is
provided through `DATABASE_URL`; canonical DDL is in `database/schema/`.

Run the database-backed regression test with `DATABASE_URL` set:

```
npm run test:integration
```
