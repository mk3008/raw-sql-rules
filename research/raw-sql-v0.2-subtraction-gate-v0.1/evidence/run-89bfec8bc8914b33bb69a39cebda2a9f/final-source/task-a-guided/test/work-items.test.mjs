import assert from "node:assert/strict";
import http from "node:http";
import test from "node:test";
import pg from "pg";
import { readFile } from "node:fs/promises";
import { createServer } from "../src/server.mjs";

const databaseUrl = process.env.DATABASE_URL;

async function request(server, path) {
  const { port } = server.address();
  return new Promise((resolve, reject) => {
    http.get(`http://127.0.0.1:${port}${path}`, (response) => {
      let body = "";
      response.on("data", (chunk) => { body += chunk; });
      response.on("end", () => resolve({
        statusCode: response.statusCode,
        body: JSON.parse(body),
      }));
    }).on("error", reject);
  });
}

test("GET /work-items filters and sorts within its tenant", { skip: !databaseUrl }, async () => {
  const client = new pg.Client({ connectionString: databaseUrl });
  await client.connect();
  await client.query("DROP TABLE IF EXISTS work_items");
  await client.query(await readFile(new URL("../database/schema.sql", import.meta.url), "utf8"));
  await client.query(
    "INSERT INTO work_items (id, tenant_id, title, status, created_at) VALUES (4, '11111111-1111-1111-1111-111111111111', 'Aardvark', 'open', '2025-01-01T00:00:00Z')",
  );

  const server = createServer(databaseUrl);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  try {
    const defaultResponse = await request(server, "/work-items");
    assert.equal(defaultResponse.statusCode, 200);
    assert.deepEqual(Object.keys(defaultResponse.body[0]).sort(), ["created_at", "id", "status", "title"]);
    assert.deepEqual(defaultResponse.body.map(({ id, title, status }) => ({ id, title, status })), [
      { id: 1, title: "Alpha", status: "open" },
      { id: 2, title: "Beta", status: "closed" },
      { id: 4, title: "Aardvark", status: "open" },
    ]);

    const filtered = await request(server, "/work-items?status=closed");
    assert.equal(filtered.statusCode, 200);
    assert.deepEqual(filtered.body.map(({ id, title, status }) => ({ id, title, status })), [
      { id: 2, title: "Beta", status: "closed" },
    ]);

    const titleSorted = await request(server, "/work-items?sort=title");
    assert.deepEqual(titleSorted.body.map(({ id }) => id), [4, 1, 2]);

    const invalidSort = await request(server, "/work-items?sort=created_at");
    assert.equal(invalidSort.statusCode, 400);
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    await client.end();
  }
});
