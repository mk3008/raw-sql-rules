import http from 'node:http';
import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL ?? 'postgres://postgres:postgres@127.0.0.1:55432/contract_study'
});
const port = Number(process.env.PORT ?? 3000);

const scenarioATenants = new Set(['tenant-a', 'tenant-b']);
const scenarioAItemQueries = Object.freeze({
  name: Object.freeze({
    asc: 'SELECT id, tenant_id, name, price, status, created_at FROM items WHERE tenant_id = $1 ORDER BY name ASC',
    desc: 'SELECT id, tenant_id, name, price, status, created_at FROM items WHERE tenant_id = $1 ORDER BY name DESC'
  }),
  price: Object.freeze({
    asc: 'SELECT id, tenant_id, name, price, status, created_at FROM items WHERE tenant_id = $1 ORDER BY price ASC',
    desc: 'SELECT id, tenant_id, name, price, status, created_at FROM items WHERE tenant_id = $1 ORDER BY price DESC'
  }),
  created_at: Object.freeze({
    asc: 'SELECT id, tenant_id, name, price, status, created_at FROM items WHERE tenant_id = $1 ORDER BY created_at ASC',
    desc: 'SELECT id, tenant_id, name, price, status, created_at FROM items WHERE tenant_id = $1 ORDER BY created_at DESC'
  })
});

const json = (response, status, body) => {
  response.writeHead(status, { 'content-type': 'application/json' });
  response.end(JSON.stringify(body));
};
const requestPath = (request) => new URL(request.url ?? '/', 'http://127.0.0.1').pathname;

const scenarioAItemsRequest = (request) => {
  const parameters = new URL(request.url ?? '/', 'http://127.0.0.1').searchParams;
  const expectedNames = new Set(['tenantId', 'sort', 'direction']);

  for (const name of parameters.keys()) {
    if (!expectedNames.has(name)) return null;
  }

  const tenantIds = parameters.getAll('tenantId');
  const sorts = parameters.getAll('sort');
  const directions = parameters.getAll('direction');
  if (tenantIds.length !== 1 || sorts.length !== 1 || directions.length !== 1) return null;

  const [tenantId] = tenantIds;
  const [sort] = sorts;
  const [direction] = directions;
  if (!scenarioATenants.has(tenantId) || !scenarioAItemQueries[sort]?.[direction]) return null;

  return { tenantId, query: scenarioAItemQueries[sort][direction] };
};

const server = http.createServer(async (request, response) => {
  try {
    if (request.method === 'GET' && requestPath(request) === '/health') {
      await pool.query('select 1');
      return json(response, 200, { status: 'ok' });
    }
    if (request.method === 'GET' && requestPath(request) === '/scenario-a/items') {
      const scenarioRequest = scenarioAItemsRequest(request);
      if (!scenarioRequest) return json(response, 400, { error: 'invalid scenario-a items query' });

      const result = await pool.query(scenarioRequest.query, [scenarioRequest.tenantId]);
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
