import http from "node:http";
import pg from "pg";
import { listWorkItemsSql } from "./WorkItems.sql.mjs";

export function createServer(connectionString) {
  const pool = new pg.Pool({ connectionString });
  return http.createServer(async (request, response) => {
    if (request.url === "/health") {
      response.writeHead(200, { "content-type": "application/json" });
      response.end(JSON.stringify({ status: "ok" }));
      return;
    }
    if (request.method === "GET" && request.url.startsWith("/work-items")) {
      try {
        const query = new URL(request.url, "http://localhost").searchParams;
        const result = await pool.query({
          text: listWorkItemsSql,
          values: ["11111111-1111-1111-1111-111111111111"],
        });
        response.writeHead(200, { "content-type": "application/json" });
        response.end(JSON.stringify(result.rows));
      } catch (error) {
        response.writeHead(500, { "content-type": "application/json" });
        response.end(JSON.stringify({ error: error.message }));
      }
      return;
    }
    response.writeHead(404).end();
  });
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  createServer(process.env.DATABASE_URL).listen(Number(process.env.PORT ?? 3000));
}
