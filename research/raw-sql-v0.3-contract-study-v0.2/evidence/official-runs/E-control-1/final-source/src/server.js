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
const requestUrl = (request) => new URL(request.url ?? '/', 'http://127.0.0.1');

const itemQuery = `
  SELECT id, tenant_id, name, price, status, created_at
  FROM items
  WHERE tenant_id = $1
    AND ($2::text IS NULL OR status = $2)
  ORDER BY created_at
  LIMIT $3
`;

const validTenantId = (value) => /^[A-Za-z0-9][A-Za-z0-9_-]*$/.test(value);
const validLimit = (value) => /^(?:[1-9]|[1-4][0-9]|50)$/.test(value);

const scenarioEParams = (request) => {
  const searchParams = requestUrl(request).searchParams;
  const allowedNames = new Set(['tenantId', 'status', 'limit']);

  for (const [name] of searchParams) {
    if (!allowedNames.has(name)) {
      return { error: 'unsupported query parameter' };
    }
  }

  const tenantIds = searchParams.getAll('tenantId');
  const statuses = searchParams.getAll('status');
  const limits = searchParams.getAll('limit');
  if (tenantIds.length !== 1 || !validTenantId(tenantIds[0]) || statuses.length > 1 || limits.length > 1) {
    return { error: 'invalid query parameters' };
  }

  const status = statuses[0];
  if (status !== undefined && !['active', 'inactive', 'archived'].includes(status)) {
    return { error: 'invalid status' };
  }

  const limit = limits[0] ?? '50';
  if (!validLimit(limit)) {
    return { error: 'invalid limit' };
  }

  return { values: [tenantIds[0], status ?? null, Number(limit)] };
};

const server = http.createServer(async (request, response) => {
  try {
    if (request.method === 'GET' && requestPath(request) === '/health') {
      await pool.query('select 1');
      return json(response, 200, { status: 'ok' });
    }
    if (request.method === 'GET' && requestPath(request) === '/scenario-e/items') {
      const params = scenarioEParams(request);
      if ('error' in params) {
        return json(response, 400, { error: params.error });
      }
      const result = await pool.query(itemQuery, params.values);
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
