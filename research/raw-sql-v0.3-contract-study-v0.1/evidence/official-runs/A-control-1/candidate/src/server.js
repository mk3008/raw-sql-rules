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
const allowedItemParameters = new Set(['tenantId', 'sort', 'direction']);
const itemSortColumns = {
  name: 'name',
  price: 'price',
  created_at: 'created_at'
};
const itemDirections = {
  asc: 'ASC',
  desc: 'DESC'
};

const itemListRequest = (request) => {
  const url = new URL(request.url ?? '/', 'http://127.0.0.1');
  const parameters = url.searchParams;

  if (
    [...parameters.keys()].some((key) => !allowedItemParameters.has(key)) ||
    ['tenantId', 'sort', 'direction'].some((key) => parameters.getAll(key).length !== 1)
  ) {
    return null;
  }

  const tenantId = parameters.get('tenantId');
  const sort = parameters.get('sort');
  const direction = parameters.get('direction');
  if (!tenantId || !Object.hasOwn(itemSortColumns, sort) || !Object.hasOwn(itemDirections, direction)) {
    return null;
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
      const itemRequest = itemListRequest(request);
      if (!itemRequest) {
        return json(response, 400, { error: 'invalid item list request' });
      }

      const tenant = await pool.query('SELECT id FROM tenants WHERE id = $1', [itemRequest.tenantId]);
      if (tenant.rowCount === 0) {
        return json(response, 404, { error: 'tenant not found' });
      }

      const orderBy = `${itemSortColumns[itemRequest.sort]} ${itemDirections[itemRequest.direction]}`;
      const items = await pool.query(
        `SELECT id, tenant_id, name, price, status, created_at
         FROM items
         WHERE tenant_id = $1
         ORDER BY ${orderBy}`,
        [itemRequest.tenantId]
      );
      return json(response, 200, { items: items.rows });
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
