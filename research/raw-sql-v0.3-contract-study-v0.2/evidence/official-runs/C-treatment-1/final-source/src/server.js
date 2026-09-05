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

const itemSorts = new Set(['name', 'price', 'created_at']);
const itemStatuses = new Set(['active', 'inactive', 'archived']);

// These are the only structural variants available to this endpoint. Values
// from the request are always passed as query parameters, never as SQL syntax.
const itemsQueries = {
  name: `
    SELECT *
    FROM items
    WHERE tenant_id = $1 /* tenantId */
      AND ($2::text IS NULL OR status = $2 /* status */)
    ORDER BY name ASC, id ASC
  `,
  price: `
    SELECT *
    FROM items
    WHERE tenant_id = $1 /* tenantId */
      AND ($2::text IS NULL OR status = $2 /* status */)
    ORDER BY price ASC, id ASC
  `,
  created_at: `
    SELECT *
    FROM items
    WHERE tenant_id = $1 /* tenantId */
      AND ($2::text IS NULL OR status = $2 /* status */)
    ORDER BY created_at ASC, id ASC
  `
};

const singleQueryValue = (searchParams, name) => {
  const values = searchParams.getAll(name);
  return values.length === 1 ? values[0] : undefined;
};

const scenarioItemsRequest = (request) => {
  const searchParams = new URL(request.url ?? '/', 'http://127.0.0.1').searchParams;
  const tenantId = singleQueryValue(searchParams, 'tenantId');
  const sort = singleQueryValue(searchParams, 'sort');
  const status = singleQueryValue(searchParams, 'status');

  if (!tenantId || searchParams.getAll('tenantId').length !== 1) return { error: 'tenantId must be supplied exactly once' };
  if (searchParams.getAll('sort').length > 1 || (sort !== undefined && !itemSorts.has(sort))) return { error: 'sort is invalid' };
  if (searchParams.getAll('status').length > 1 || (status !== undefined && !itemStatuses.has(status))) return { error: 'status is invalid' };

  return { tenantId, sort: sort ?? 'name', status: status ?? null };
};

const server = http.createServer(async (request, response) => {
  try {
    if (request.method === 'GET' && requestPath(request) === '/health') {
      await pool.query('select 1');
      return json(response, 200, { status: 'ok' });
    }
    if (request.method === 'GET' && requestPath(request) === '/scenario-c/items') {
      const scenario = scenarioItemsRequest(request);
      if ('error' in scenario) return json(response, 400, { error: scenario.error });

      const result = await pool.query(itemsQueries[scenario.sort], [scenario.tenantId, scenario.status]);
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
