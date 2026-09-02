import http from "node:http";
import { toResponse } from "./mapper.mjs";

const account = { id: "acct-42", status: "ACTIVE" };

export function createServer() {
  return http.createServer((request, response) => {
    if (request.method === "GET" && request.url === "/account") {
      response.writeHead(200, { "content-type": "application/json" });
      response.end(JSON.stringify(toResponse(account)));
      return;
    }
    response.writeHead(404).end();
  });
}
