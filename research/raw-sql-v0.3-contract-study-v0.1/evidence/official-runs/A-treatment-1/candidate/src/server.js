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

const itemSortColumns = Object.freeze({
  name: 'name',
  price: 'price',
  created_at: 'created_at'
});
const itemSortDirections = new Set(['asc', 'desc']);

const getSingleQueryParameter = (searchParams, name) => {
  const values = searchParams.getAll(name);
  return values.length === 1 ? values[0] : undefined;
};

const itemListQuery = (sortColumn, direction) => `
  SELECT id, tenant_id, name, price, status, created_at
  FROM items
  WHERE tenant_id = $1
  ORDER BY ${sortColumn} ${direction}, id ASC
`;

const server = http.createServer(async (request, response) => {
  try {
    if (request.method === 'GET' && requestPath(request) === '/health') {
      await pool.query('select 1');
      return json(response, 200, { status: 'ok' });
    }
    if (request.method === 'GET' && requestPath(request) === '/scenario-a/items') {
      const requestUrl = new URL(request.url ?? '/', 'http://127.0.0.1');
      const tenantId = getSingleQueryParameter(requestUrl.searchParams, 'tenantId');
      const sort = getSingleQueryParameter(requestUrl.searchParams, 'sort');
      const direction = getSingleQueryParameter(requestUrl.searchParams, 'direction');
      const sortColumn = itemSortColumns[sort];

      if (!tenantId || !sortColumn || !itemSortDirections.has(direction)) {
        return json(response, 400, { error: 'invalid tenantId, sort, or direction' });
      }

      const result = await pool.query(itemListQuery(sortColumn, direction.toUpperCase()), [tenantId]);
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
