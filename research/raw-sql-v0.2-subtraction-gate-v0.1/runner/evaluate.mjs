import { pathToFileURL } from "node:url";
import { join } from "node:path";

const [task, workspace, port, connectionString] = process.argv.slice(2);
const defects = [];
const check = (condition, message) => { if (!condition) defects.push(message); };
const request = async (path) => {
  const response = await fetch(`http://127.0.0.1:${port}${path}`);
  let body = null;
  try { body = await response.json(); } catch {}
  return { status: response.status, body };
};

let server;
try {
  const { createServer } = await import(`${pathToFileURL(join(workspace, "src", "server.mjs")).href}?evaluation=${Date.now()}`);
  server = createServer(connectionString);
  await new Promise((resolve, reject) => server.listen(Number(port), "127.0.0.1", (error) => error ? reject(error) : resolve()));
  check((await request("/health")).status === 200, "health endpoint failed");

  if (task === "task-a") {
    const all = await request("/work-items?sort=createdAt");
    check(all.status === 200 && Array.isArray(all.body) && all.body.map((row) => row.title).join(",") === "Alpha,Beta", "unfiltered tenant result or createdAt sort is wrong");
    const open = await request("/work-items?status=open&sort=title");
    check(open.status === 200 && open.body?.length === 1 && open.body[0].title === "Alpha" && open.body[0].status === "open", "optional status filter is wrong");
    const closed = await request("/work-items?status=closed&sort=title");
    check(closed.status === 200 && closed.body?.length === 1 && closed.body[0].title === "Beta", "closed filter is wrong");
    check((await request("/work-items?sort=unknown")).status === 400, "unknown sort is not rejected");
    check((await request("/work-items?sort=title%3BDROP%20TABLE%20work_items%3B--")).status === 400, "injection-shaped sort is not rejected");
    const after = await request("/work-items?sort=title");
    check(after.status === 200 && after.body?.length === 2, "tenant data was not preserved after unsafe-sort probe");
  } else if (task === "task-b") {
    const account = await request("/accounts/11111111-1111-1111-1111-111111111111");
    check(account.status === 200, "account endpoint failed");
    check(account.body?.id === "11111111-1111-1111-1111-111111111111", "account id changed");
    check(account.body?.balance === "9007199254740993", "bigint decimal representation lost precision or is not a string");
    check((await request("/accounts/22222222-2222-2222-2222-222222222222")).status === 404, "not-found behavior changed");
  } else {
    throw new Error(`unknown task ${task}`);
  }
} catch (error) {
  defects.push(error instanceof Error ? error.message : String(error));
} finally {
  if (server) await new Promise((resolve) => server.close(resolve));
}

console.log(JSON.stringify({ task, primary: defects.length ? "FAIL" : "PASS", confirmedDefects: defects }));
process.exitCode = defects.length ? 1 : 0;
