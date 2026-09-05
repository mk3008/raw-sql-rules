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

// Authoritative SQL source for the scenario-b item listing. `$1` and `$2`
// correspond to the meaningfully named values validated at the HTTP boundary.
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
  const statuses = url.searchParams.getAll('status');
  if (tenantIds.length !== 1 || tenantIds[0] === '') {
    return { error: 'tenantId must be supplied exactly once' };
  }
  if (statuses.length > 1) {
    return { error: 'status may be supplied at most once' };
  }
  if (statuses.length === 1 && !ITEM_STATUSES.has(statuses[0])) {
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
      const scenarioRequest = scenarioBItemsRequest(request);
      if ('error' in scenarioRequest) {
        return json(response, 400, { error: scenarioRequest.error });
      }

      const result = await pool.query(scenarioBItemsSql, [
        scenarioRequest.tenantId,
        scenarioRequest.status
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
