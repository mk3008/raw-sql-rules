import http from "node:http";
import pg from "pg";
import { getAccountSql } from "./GetAccount.sql.mjs";

export function createServer(connectionString) {
  const pool = new pg.Pool({ connectionString });
  return http.createServer(async (request, response) => {
    const match = request.method === "GET" && request.url.match(/^\/accounts\/([^/?]+)$/);
    if (request.url === "/health") {
      response.writeHead(200, { "content-type": "application/json" });
      response.end(JSON.stringify({ status: "ok" }));
      return;
    }
    if (match) {
      try {
        const result = await pool.query({ text: getAccountSql, values: [match[1]] });
        if (result.rowCount === 0) { response.writeHead(404).end(); return; }
        response.writeHead(200, { "content-type": "application/json" });
        response.end(JSON.stringify({ id: result.rows[0].id, balance: result.rows[0].balance }));
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
