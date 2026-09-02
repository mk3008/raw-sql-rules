import assert from "node:assert/strict";
import http from "node:http";
import { createServer } from "./server.mjs";

function request(port) {
  return new Promise((resolve, reject) => {
    http.get({ host: "127.0.0.1", port, path: "/account" }, (response) => {
      let body = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => { body += chunk; });
      response.on("end", () => resolve({ statusCode: response.statusCode, body }));
    }).on("error", reject);
  });
}

const server = createServer();
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));

try {
  const address = server.address();
  const response = await request(address.port);
  assert.equal(response.statusCode, 200);
  assert.deepEqual(JSON.parse(response.body), { id: "acct-42", status: "ACTIVE" });
  console.log("E2E response contract passed.");
} finally {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
}
