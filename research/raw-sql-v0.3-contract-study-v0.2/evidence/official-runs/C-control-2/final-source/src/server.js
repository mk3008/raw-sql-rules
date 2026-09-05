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

const itemQueriesBySort = Object.freeze({
  name: `
    SELECT id, tenant_id, name, price, status, created_at
    FROM items
    WHERE tenant_id = $1 /* tenantId */
      AND ($2::text IS NULL OR status = $2) /* status */
    ORDER BY name ASC
  `,
  price: `
    SELECT id, tenant_id, name, price, status, created_at
    FROM items
    WHERE tenant_id = $1 /* tenantId */
      AND ($2::text IS NULL OR status = $2) /* status */
    ORDER BY price ASC
  `,
  created_at: `
    SELECT id, tenant_id, name, price, status, created_at
    FROM items
    WHERE tenant_id = $1 /* tenantId */
      AND ($2::text IS NULL OR status = $2) /* status */
    ORDER BY created_at ASC
  `
});

const scenarioCRequest = (request) => {
  const url = new URL(request.url ?? '/', 'http://127.0.0.1');
  const allowedParameters = new Set(['tenantId', 'sort', 'status']);

  for (const parameter of url.searchParams.keys()) {
    if (!allowedParameters.has(parameter)) {
      return { error: `unsupported query parameter: ${parameter}` };
    }
  }

  const tenantIds = url.searchParams.getAll('tenantId');
  const sorts = url.searchParams.getAll('sort');
  const statuses = url.searchParams.getAll('status');

  if (tenantIds.length !== 1 || tenantIds[0] === '') {
    return { error: 'tenantId must be supplied exactly once' };
  }
  if (sorts.length > 1 || statuses.length > 1) {
    return { error: 'sort and status may each be supplied at most once' };
  }

  const sort = sorts[0] ?? 'name';
  const status = statuses[0] ?? null;
  if (!(sort in itemQueriesBySort)) {
    return { error: 'sort must be one of: name, price, created_at' };
  }
  if (status !== null && !['active', 'inactive', 'archived'].includes(status)) {
    return { error: 'status must be one of: active, inactive, archived' };
  }

  return { tenantId: tenantIds[0], sort, status };
};

const server = http.createServer(async (request, response) => {
  try {
    if (request.method === 'GET' && requestPath(request) === '/health') {
      await pool.query('select 1');
      return json(response, 200, { status: 'ok' });
    }
    if (request.method === 'GET' && requestPath(request) === '/scenario-c/items') {
      const query = scenarioCRequest(request);
      if ('error' in query) {
        return json(response, 400, { error: query.error });
      }
      const result = await pool.query(itemQueriesBySort[query.sort], [query.tenantId, query.status]);
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
