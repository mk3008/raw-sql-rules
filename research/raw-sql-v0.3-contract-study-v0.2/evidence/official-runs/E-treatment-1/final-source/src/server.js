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

// Authoritative SQL source for GET /scenario-e/items.
// $1 tenantId, $2 status (or null), $3 limit
const scenarioEItemsSql = `
  SELECT id, tenant_id, name, price, status, created_at
  FROM items
  WHERE tenant_id = $1
    AND ($2::text IS NULL OR status = $2)
  ORDER BY created_at
  LIMIT $3
`;

const singleQueryValue = (parameters, name) => {
  const values = parameters.getAll(name);
  return values.length === 1 ? values[0] : undefined;
};

const scenarioERequest = (request) => {
  const parameters = new URL(request.url ?? '/', 'http://127.0.0.1').searchParams;
  if ([...parameters.keys()].some((name) => !['tenantId', 'status', 'limit'].includes(name))) {
    return { error: 'unsupported query parameter' };
  }
  const tenantId = singleQueryValue(parameters, 'tenantId');
  const status = singleQueryValue(parameters, 'status');
  const limit = singleQueryValue(parameters, 'limit');

  if (!tenantId || !/^[a-z][a-z0-9-]*$/.test(tenantId)) {
    return { error: 'tenantId must be supplied exactly once' };
  }
  if (parameters.getAll('status').length > 1 || (status !== undefined && !['active', 'inactive', 'archived'].includes(status))) {
    return { error: 'status must be active, inactive, or archived' };
  }
  if (parameters.getAll('limit').length > 1 || (limit !== undefined && !/^(?:[1-9]|[1-4][0-9]|50)$/.test(limit))) {
    return { error: 'limit must be a decimal integer from 1 through 50' };
  }

  return { tenantId, status: status ?? null, limit: limit === undefined ? 50 : Number(limit) };
};

const server = http.createServer(async (request, response) => {
  try {
    if (request.method === 'GET' && requestPath(request) === '/health') {
      await pool.query('select 1');
      return json(response, 200, { status: 'ok' });
    }
    if (request.method === 'GET' && requestPath(request) === '/scenario-e/items') {
      const scenario = scenarioERequest(request);
      if ('error' in scenario) return json(response, 400, { error: scenario.error });

      const result = await pool.query(scenarioEItemsSql, [scenario.tenantId, scenario.status, scenario.limit]);
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
