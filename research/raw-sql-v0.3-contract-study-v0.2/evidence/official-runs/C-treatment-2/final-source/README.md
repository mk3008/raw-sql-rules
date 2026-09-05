# Raw SQL contract study fixture

This is a small Node.js application backed by PostgreSQL and `node-postgres`.
The database is initialized from `database/init.sql`; the application listens
on `PORT` and uses `DATABASE_URL`.

Run it locally with Docker and npm:

```sh
docker compose up -d postgres
npm install
DATABASE_URL=postgres://postgres:postgres@127.0.0.1:55432/contract_study PORT=3000 npm start
```

On PowerShell, set the two environment variables before `npm start`. Stop the
database with `docker compose down --volumes` after a run. The source is kept
deliberately small and does not require a web framework.
