# Work Items C# VSA PostgreSQL example

Bootstrap application for the Raw SQL Rules dogfood. The app targets `net9.0` because the environment provides .NET SDK 9.0.300; .NET 10 was current LTS at setup time but unavailable locally.

Start PostgreSQL with `docker compose up -d`, and stop it with `docker compose down -v`.

The application connection string is `Host=localhost;Port=54329;Database=work_items;Username=work_items;Password=work_items`.

The canonical schema and seed data are under `database/`.

Available endpoints:

- `GET /work-items?ownerId=&status=&createdFrom=&createdTo=&sort=&page=&pageSize=`
- `POST /work-items/{id}/complete`

Supported `sort` values:

- `created_desc`
- `created_asc`
- `priority_desc`

Run the application tests with `dotnet test WorkItems.sln`.
