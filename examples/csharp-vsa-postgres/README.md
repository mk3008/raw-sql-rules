# Work Items C# VSA PostgreSQL example

Bootstrap application for the Raw SQL Rules dogfood. The app targets `net9.0` because the environment provides .NET SDK 9.0.300; .NET 10 was current LTS at setup time but unavailable locally.

Start PostgreSQL with `docker compose up -d`, and stop it with `docker compose down -v`.

The application connection string is `Host=localhost;Port=54329;Database=work_items;Username=work_items;Password=work_items`.

The canonical schema and seed data are under `database/`. No application SQL or database-backed application regression path exists in this initial state.
