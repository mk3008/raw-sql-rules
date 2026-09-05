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

const itemStatuses = new Set(['active', 'inactive', 'archived']);

// Authoritative query for GET /scenario-b/items.
// $1 is tenantId and $2 is the optional status filter.
const scenarioBItemsSql = `
  SELECT id, tenant_id, name, price, status, created_at
  FROM items
  WHERE tenant_id = $1
    AND ($2::text IS NULL OR status = $2)
  ORDER BY created_at
`;

const scenarioBItemsRequest = (request) => {
  const url = new URL(request.url ?? '/', 'http://127.0.0.1');
  const allowedParameters = new Set(['tenantId', 'status']);

  for (const parameter of url.searchParams.keys()) {
    if (!allowedParameters.has(parameter)) {
      return { error: 'unsupported query parameter' };
    }
  }

  const tenantIds = url.searchParams.getAll('tenantId');
  if (tenantIds.length !== 1 || tenantIds[0] === '') {
    return { error: 'exactly one tenantId is required' };
  }

  const statuses = url.searchParams.getAll('status');
  if (statuses.length > 1 || (statuses.length === 1 && !itemStatuses.has(statuses[0]))) {
    return { error: 'status must be active, inactive, or archived' };
  }

  return { tenantId: tenantIds[0], status: statuses[0] ?? null };
};

const server = http.createServer(async (request, response) => {
  try {
    if (request.method === 'GET' && requestPath(request) === '/health') {
      await pool.query('select 1');
      return json(response, 200, { status: 'ok' });
    }
    if (request.method === 'GET' && requestPath(request) === '/scenario-b/items') {
      const query = scenarioBItemsRequest(request);
      if ('error' in query) {
        return json(response, 400, { error: query.error });
      }

      const result = await pool.query({
        text: scenarioBItemsSql,
        values: [query.tenantId, query.status]
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
