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

const itemSortColumns = Object.freeze({
  name: 'name',
  price: 'price',
  created_at: 'created_at'
});
const itemStatuses = new Set(['active', 'inactive', 'archived']);

const invalidRequest = (response, message) => json(response, 400, { error: message });

const scenarioItemsRequest = (request) => {
  const query = new URL(request.url ?? '/', 'http://127.0.0.1').searchParams;
  const allowedKeys = new Set(['tenantId', 'sort', 'status']);

  for (const key of query.keys()) {
    if (!allowedKeys.has(key)) return { error: `unsupported query parameter: ${key}` };
  }

  const tenantIds = query.getAll('tenantId');
  const sorts = query.getAll('sort');
  const statuses = query.getAll('status');

  if (tenantIds.length !== 1 || tenantIds[0] === '') {
    return { error: 'tenantId must be supplied exactly once' };
  }
  if (sorts.length > 1 || (sorts.length === 1 && !(sorts[0] in itemSortColumns))) {
    return { error: 'sort must be one of name, price, or created_at' };
  }
  if (statuses.length > 1 || (statuses.length === 1 && !itemStatuses.has(statuses[0]))) {
    return { error: 'status must be one of active, inactive, or archived' };
  }

  return {
    tenantId: tenantIds[0],
    sort: sorts[0] ?? 'name',
    status: statuses[0] ?? null
  };
};

const scenarioItemsQuery = (sort) => `
  SELECT id, tenant_id, name, price, status, created_at
  FROM items
  WHERE tenant_id = $1 /* tenantId */
    AND ($2::text IS NULL OR status = $2) /* status */
  ORDER BY ${itemSortColumns[sort]} ASC
`;

const server = http.createServer(async (request, response) => {
  try {
    if (request.method === 'GET' && requestPath(request) === '/health') {
      await pool.query('select 1');
      return json(response, 200, { status: 'ok' });
    }
    if (request.method === 'GET' && requestPath(request) === '/scenario-c/items') {
      const scenario = scenarioItemsRequest(request);
      if ('error' in scenario) return invalidRequest(response, scenario.error);

      const result = await pool.query({
        text: scenarioItemsQuery(scenario.sort),
        values: [scenario.tenantId, scenario.status]
      });
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
