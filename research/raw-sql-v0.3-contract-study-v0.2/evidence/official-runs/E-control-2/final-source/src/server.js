import http from 'node:http';
import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL ?? 'postgres://postgres:postgres@127.0.0.1:55432/contract_study'
});
const port = Number(process.env.PORT ?? 3000);

const json = (response, status, body) => {
  response.writeHead(status, { 'content-type': 'application/json' });
  response.end(JSON.stringify(body));
};
const requestPath = (request) => new URL(request.url ?? '/', 'http://127.0.0.1').pathname;
const allowedStatuses = new Set(['active', 'inactive', 'archived']);
const tenantIdPattern = /^[A-Za-z0-9][A-Za-z0-9_-]*$/;
const limitPattern = /^(?:[1-9]|[1-4][0-9]|50)$/;

const scenarioEQuery = `
  SELECT id, tenant_id, name, price, status, created_at
  FROM items
  WHERE tenant_id = $1
    AND ($2::text IS NULL OR status = $2)
  ORDER BY created_at ASC
  LIMIT $3
`;

const invalidScenarioERequest = (response) =>
  json(response, 400, { error: 'invalid scenario-e request' });

const scenarioEParameters = (request) => {
  const url = new URL(request.url ?? '/', 'http://127.0.0.1');
  const permittedKeys = new Set(['tenantId', 'status', 'limit']);

  if ([...url.searchParams.keys()].some((key) => !permittedKeys.has(key))) return null;

  const tenantIds = url.searchParams.getAll('tenantId');
  const statuses = url.searchParams.getAll('status');
  const limits = url.searchParams.getAll('limit');
  if (tenantIds.length !== 1 || statuses.length > 1 || limits.length > 1) return null;

  const [tenantId] = tenantIds;
  const status = statuses[0] ?? null;
  const limit = limits[0] ?? '50';
  if (!tenantIdPattern.test(tenantId) || (status !== null && !allowedStatuses.has(status)) || !limitPattern.test(limit)) {
    return null;
  }

  return [tenantId, status, Number(limit)];
};

const server = http.createServer(async (request, response) => {
  try {
    if (request.method === 'GET' && requestPath(request) === '/health') {
      await pool.query('select 1');
      return json(response, 200, { status: 'ok' });
    }
    if (request.method === 'GET' && requestPath(request) === '/scenario-e/items') {
      const parameters = scenarioEParameters(request);
      if (parameters === null) return invalidScenarioERequest(response);
      const result = await pool.query(scenarioEQuery, parameters);
      return json(response, 200, result.rows);
    }
    // The application surface is intentionally small. Unknown endpoints remain inert.
    return json(response, 404, { error: 'not found' });
  } catch (error) {
    return json(response, 500, { error: error instanceof Error ? error.message : String(error) });
  }
});

server.listen(port, '127.0.0.1');
const shutdown = async () => { await pool.end(); server.close(); };
process.once('SIGTERM', shutdown);
process.once('SIGINT', shutdown);
