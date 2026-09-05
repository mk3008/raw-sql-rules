import http from 'node:http';
import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL ?? 'postgres://postgres:postgres@127.0.0.1:55432/contract_study'
});
const port = Number(process.env.PORT ?? 3000);
const supportedStatuses = new Set(['active', 'inactive', 'archived']);

const itemQuery = `
  SELECT id, tenant_id, name, price, status, created_at
  FROM items
  WHERE tenant_id = $1
    AND ($2::text IS NULL OR status = $2)
  ORDER BY created_at
`;

const json = (response, status, body) => {
  response.writeHead(status, { 'content-type': 'application/json' });
  response.end(JSON.stringify(body));
};
const requestPath = (request) => new URL(request.url ?? '/', 'http://127.0.0.1').pathname;
const requestUrl = (request) => new URL(request.url ?? '/', 'http://127.0.0.1');

const scenarioBItemsRequest = (request) => {
  const search = requestUrl(request).searchParams;
  const supportedParameters = new Set(['tenantId', 'status']);

  if ([...search.keys()].some((name) => !supportedParameters.has(name))) {
    return { error: 'unsupported query parameter' };
  }

  const tenantIds = search.getAll('tenantId');
  const statuses = search.getAll('status');
  if (tenantIds.length !== 1 || tenantIds[0] === '') {
    return { error: 'exactly one tenantId is required' };
  }
  if (statuses.length > 1) {
    return { error: 'at most one status is allowed' };
  }
  if (statuses.length === 1 && !supportedStatuses.has(statuses[0])) {
    return { error: 'unsupported status' };
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
      const scenario = scenarioBItemsRequest(request);
      if ('error' in scenario) {
        return json(response, 400, { error: scenario.error });
      }
      const result = await pool.query(itemQuery, [scenario.tenantId, scenario.status]);
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
