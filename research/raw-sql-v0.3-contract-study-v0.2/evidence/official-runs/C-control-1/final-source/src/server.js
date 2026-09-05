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
const ITEM_SORTS = new Map([
  ['name', 'name ASC'],
  ['price', 'price ASC'],
  ['created_at', 'created_at ASC']
]);
const ITEM_STATUSES = new Set(['active', 'inactive', 'archived']);

const scenarioCItemsRequest = (request) => {
  const url = new URL(request.url ?? '/', 'http://127.0.0.1');
  const supportedParameters = new Set(['tenantId', 'sort', 'status']);

  if ([...url.searchParams.keys()].some((key) => !supportedParameters.has(key))) {
    return { error: 'unsupported query parameter' };
  }

  const tenantIds = url.searchParams.getAll('tenantId');
  const sorts = url.searchParams.getAll('sort');
  const statuses = url.searchParams.getAll('status');
  if (tenantIds.length !== 1 || tenantIds[0] === '') {
    return { error: 'tenantId must be provided exactly once' };
  }
  if (sorts.length > 1 || (sorts.length === 1 && !ITEM_SORTS.has(sorts[0]))) {
    return { error: 'invalid sort' };
  }
  if (statuses.length > 1 || (statuses.length === 1 && !ITEM_STATUSES.has(statuses[0]))) {
    return { error: 'invalid status' };
  }

  return {
    tenantId: tenantIds[0],
    sort: sorts[0] ?? 'name',
    status: statuses[0] ?? null
  };
};

const server = http.createServer(async (request, response) => {
  try {
    if (request.method === 'GET' && requestPath(request) === '/health') {
      await pool.query('select 1');
      return json(response, 200, { status: 'ok' });
    }
    if (request.method === 'GET' && requestPath(request) === '/scenario-c/items') {
      const options = scenarioCItemsRequest(request);
      if ('error' in options) {
        return json(response, 400, { error: options.error });
      }

      const orderBy = ITEM_SORTS.get(options.sort);
      const result = await pool.query(
        `SELECT id, tenant_id, name, price, status, created_at
         FROM items
         WHERE tenant_id = $1 AND ($2::text IS NULL OR status = $2)
         ORDER BY ${orderBy}`,
        [options.tenantId, options.status]
      );
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
