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

const ITEM_STATUSES = new Set(['active', 'inactive', 'archived']);
const TENANT_ID = /^[A-Za-z0-9][A-Za-z0-9-]*$/;
const LIMIT = /^(?:[1-9]|[1-4][0-9]|50)$/;

// $1: tenantId, $2: status (nullable), $3: limit
const SELECT_SCENARIO_E_ITEMS = `
  SELECT id, tenant_id, name, price, status, created_at
  FROM items
  WHERE tenant_id = $1
    AND ($2::text IS NULL OR status = $2)
  ORDER BY created_at
  LIMIT $3
`;

const scenarioEItemsRequest = (request) => {
  const url = new URL(request.url ?? '/', 'http://127.0.0.1');
  const supported = new Set(['tenantId', 'status', 'limit']);

  for (const key of url.searchParams.keys()) {
    if (!supported.has(key)) return { error: 'unsupported query parameter' };
  }

  const tenantIds = url.searchParams.getAll('tenantId');
  const statuses = url.searchParams.getAll('status');
  const limits = url.searchParams.getAll('limit');
  if (tenantIds.length !== 1 || statuses.length > 1 || limits.length > 1) {
    return { error: 'invalid query parameters' };
  }

  const [tenantId] = tenantIds;
  const status = statuses[0] ?? null;
  const limit = limits[0] ?? '50';
  if (!TENANT_ID.test(tenantId) || (status !== null && !ITEM_STATUSES.has(status)) || !LIMIT.test(limit)) {
    return { error: 'invalid query parameters' };
  }

  return { tenantId, status, limit: Number(limit) };
};

const server = http.createServer(async (request, response) => {
  try {
    if (request.method === 'GET' && requestPath(request) === '/health') {
      await pool.query('select 1');
      return json(response, 200, { status: 'ok' });
    }
    if (request.method === 'GET' && requestPath(request) === '/scenario-e/items') {
      const parameters = scenarioEItemsRequest(request);
      if ('error' in parameters) return json(response, 400, { error: parameters.error });

      const result = await pool.query(SELECT_SCENARIO_E_ITEMS, [
        parameters.tenantId,
        parameters.status,
        parameters.limit
      ]);
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
