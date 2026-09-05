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

const itemSortColumns = {
  name: 'name',
  price: 'price',
  created_at: 'created_at'
};
const itemSortDirections = {
  asc: 'ASC',
  desc: 'DESC'
};
const validTenantIds = new Set(['tenant-a', 'tenant-b']);

const singleQueryValue = (params, name) => {
  const values = params.getAll(name);
  return values.length === 1 ? values[0] : undefined;
};

const scenarioAItemsRequest = (request) => {
  const url = new URL(request.url ?? '/', 'http://127.0.0.1');
  const tenantId = singleQueryValue(url.searchParams, 'tenantId');
  const sort = singleQueryValue(url.searchParams, 'sort');
  const direction = singleQueryValue(url.searchParams, 'direction');

  if (
    !tenantId || !validTenantIds.has(tenantId) ||
    !sort || !Object.hasOwn(itemSortColumns, sort) ||
    !direction || !Object.hasOwn(itemSortDirections, direction)
  ) {
    return undefined;
  }

  return { tenantId, sort, direction };
};

const server = http.createServer(async (request, response) => {
  try {
    if (request.method === 'GET' && requestPath(request) === '/health') {
      await pool.query('select 1');
      return json(response, 200, { status: 'ok' });
    }
    if (request.method === 'GET' && requestPath(request) === '/scenario-a/items') {
      const scenario = scenarioAItemsRequest(request);
      if (!scenario) {
        return json(response, 400, { error: 'invalid scenario-a items request' });
      }

      const orderBy = `${itemSortColumns[scenario.sort]} ${itemSortDirections[scenario.direction]}`;
      const result = await pool.query(
        `SELECT id, tenant_id, name, price, status, created_at
         FROM items
         WHERE tenant_id = $1
         ORDER BY ${orderBy}`,
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
