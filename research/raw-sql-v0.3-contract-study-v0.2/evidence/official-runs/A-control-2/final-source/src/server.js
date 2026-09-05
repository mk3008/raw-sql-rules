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

const scenarioAItemOrder = {
  name: 'name',
  price: 'price',
  created_at: 'created_at'
};
const scenarioADirections = {
  asc: 'ASC',
  desc: 'DESC'
};
const scenarioATenants = new Set(['tenant-a', 'tenant-b']);

const scenarioARequest = (request) => {
  const url = new URL(request.url ?? '/', 'http://127.0.0.1');
  const supportedParameters = new Set(['tenantId', 'sort', 'direction']);
  const hasOnlySupportedParameters = [...url.searchParams.keys()]
    .every((key) => supportedParameters.has(key));
  const values = Object.fromEntries([...supportedParameters].map((key) => [key, url.searchParams.getAll(key)]));

  if (!hasOnlySupportedParameters || Object.values(values).some((value) => value.length !== 1)) {
    return null;
  }

  const tenantId = values.tenantId[0];
  const sort = values.sort[0];
  const direction = values.direction[0];
  if (!scenarioATenants.has(tenantId)
    || !Object.hasOwn(scenarioAItemOrder, sort)
    || !Object.hasOwn(scenarioADirections, direction)) {
    return null;
  }

  return { tenantId, sort, direction };
};

const scenarioAItemsSql = (sort, direction) => `
  SELECT id, tenant_id, name, price, status, created_at
  FROM items
  WHERE tenant_id = $1
  ORDER BY ${scenarioAItemOrder[sort]} ${scenarioADirections[direction]}
`;

const server = http.createServer(async (request, response) => {
  try {
    if (request.method === 'GET' && requestPath(request) === '/health') {
      await pool.query('select 1');
      return json(response, 200, { status: 'ok' });
    }
    if (request.method === 'GET' && requestPath(request) === '/scenario-a/items') {
      const scenario = scenarioARequest(request);
      if (scenario === null) {
        return json(response, 400, { error: 'invalid scenario-a items query' });
      }

      const result = await pool.query(
        scenarioAItemsSql(scenario.sort, scenario.direction),
        [scenario.tenantId]
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
