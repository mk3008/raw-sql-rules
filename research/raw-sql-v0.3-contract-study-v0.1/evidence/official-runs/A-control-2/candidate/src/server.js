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

const itemSortColumns = {
  name: 'name',
  price: 'price',
  created_at: 'created_at'
};
const itemSortDirections = {
  asc: 'ASC',
  desc: 'DESC'
};

const singleQueryParameter = (url, name) => {
  const values = url.searchParams.getAll(name);
  return values.length === 1 ? values[0] : undefined;
};

const itemQuery = (sort, direction) => `
  SELECT id, tenant_id, name, price, status, created_at
  FROM items
  WHERE tenant_id = $1
  ORDER BY ${itemSortColumns[sort]} ${itemSortDirections[direction]}, id ASC
`;

const server = http.createServer(async (request, response) => {
  try {
    if (request.method === 'GET' && requestPath(request) === '/health') {
      await pool.query('select 1');
      return json(response, 200, { status: 'ok' });
    }
    if (request.method === 'GET' && requestPath(request) === '/scenario-a/items') {
      const url = requestUrl(request);
      const tenantId = singleQueryParameter(url, 'tenantId');
      const sort = singleQueryParameter(url, 'sort');
      const direction = singleQueryParameter(url, 'direction');

      if (!tenantId || !Object.hasOwn(itemSortColumns, sort) || !Object.hasOwn(itemSortDirections, direction)) {
        return json(response, 400, { error: 'tenantId, sort, and direction must be valid single query parameters' });
      }

      const result = await pool.query(itemQuery(sort, direction), [tenantId]);
      return json(response, 200, { items: result.rows });
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
