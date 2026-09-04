import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import test from "node:test";
import pg from "pg";

const connectionString = process.env.DATABASE_URL;

test("GET /accounts/:id returns bigint balances as exact decimal strings", { skip: !connectionString }, async () => {
  const client = new pg.Client({ connectionString });
  await client.connect();
  await client.query("DROP TABLE IF EXISTS accounts");
  await client.query(await readFile(new URL("../database/schema.sql", import.meta.url), "utf8"));

  const child = spawn(process.execPath, ["--input-type=module", "--eval", `
    import { createServer } from "./src/server.mjs";
    const server = createServer(process.env.DATABASE_URL);
    server.listen(0, "127.0.0.1", () => process.stdout.write(String(server.address().port)));
  `], { cwd: process.cwd(), env: process.env, stdio: ["ignore", "pipe", "inherit"] });

  try {
    const port = await new Promise((resolve, reject) => {
      child.stdout.once("data", (data) => resolve(Number(data)));
      child.once("error", reject);
      child.once("exit", (code) => reject(new Error(`Server exited with code ${code}`)));
    });
    const found = await fetch(`http://127.0.0.1:${port}/accounts/11111111-1111-1111-1111-111111111111`);
    assert.equal(found.status, 200);
    assert.deepEqual(await found.json(), { id: "11111111-1111-1111-1111-111111111111", balance: "9007199254740993" });

    const missing = await fetch(`http://127.0.0.1:${port}/accounts/22222222-2222-2222-2222-222222222222`);
    assert.equal(missing.status, 404);
  } finally {
    child.kill();
    await client.end();
  }
});
