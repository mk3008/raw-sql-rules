import http from "node:http";
import pg from "pg";
import {
  listWorkItemsByCreatedAtSql,
  listWorkItemsByTitleSql,
} from "./WorkItems.sql.mjs";

const workItemSorts = {
  createdAt: listWorkItemsByCreatedAtSql,
  title: listWorkItemsByTitleSql,
};

export function createServer(connectionString) {
  const pool = new pg.Pool({ connectionString });
  const server = http.createServer(async (request, response) => {
    if (request.url === "/health") {
      response.writeHead(200, { "content-type": "application/json" });
      response.end(JSON.stringify({ status: "ok" }));
      return;
    }
    if (request.method === "GET" && request.url.startsWith("/work-items")) {
      try {
        const query = new URL(request.url, "http://localhost").searchParams;
        const sort = query.get("sort") ?? "createdAt";
        const sql = workItemSorts[sort];
        if (sql === undefined) {
          response.writeHead(400, { "content-type": "application/json" });
          response.end(JSON.stringify({ error: "sort must be createdAt or title" }));
          return;
        }
        const result = await pool.query({
          text: sql,
          values: [
            "11111111-1111-1111-1111-111111111111",
            query.get("status"),
          ],
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
  server.on("close", () => { void pool.end(); });
  return server;
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  createServer(process.env.DATABASE_URL).listen(Number(process.env.PORT ?? 3000));
}
