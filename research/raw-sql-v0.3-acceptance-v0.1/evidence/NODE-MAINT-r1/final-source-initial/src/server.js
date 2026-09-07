import http from 'node:http';
import pg from 'pg';
import { SELECT_SCENARIO_E_ITEMS } from './scenario-e-items.sql.js';

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
const TENANT_ID = /^[A-Za-z0-9][A-Za-z0-9-]*$/;
const LIMIT = /^(?:[1-9]|[1-4][0-9]|50)$/;
const POSITIVE_INTEGER_DECIMAL = /^[1-9][0-9]*$/;
const MAX_POSTGRES_INTEGER = 2147483647;

const bindNamedParameters = (sql, bindings) => {
  const values = [];
  const text = sql.replace(/(?<!:):([A-Za-z][A-Za-z0-9_]*)\b/g, (_match, name) => {
    if (!Object.hasOwn(bindings, name)) throw new Error(`missing SQL binding: ${name}`);
    values.push(bindings[name]);
    return `$${values.length}`;
  });
  return { text, values };
};

const scenarioEItemsRequest = (request) => {
  const url = new URL(request.url ?? '/', 'http://127.0.0.1');
  const supported = new Set(['tenantId', 'status', 'limit', 'minPrice']);

  for (const key of url.searchParams.keys()) {
    if (!supported.has(key)) return { error: 'unsupported query parameter' };
  }

  const tenantIds = url.searchParams.getAll('tenantId');
  const statuses = url.searchParams.getAll('status');
  const limits = url.searchParams.getAll('limit');
  const minPrices = url.searchParams.getAll('minPrice');
  if (tenantIds.length !== 1 || statuses.length > 1 || limits.length > 1 || minPrices.length > 1) {
    return { error: 'invalid query parameters' };
  }

  const [tenantId] = tenantIds;
  const status = statuses[0] ?? null;
  const limit = limits[0] ?? '50';
  const minPrice = minPrices[0] ?? null;
  if (
    !TENANT_ID.test(tenantId)
    || (status !== null && !ITEM_STATUSES.has(status))
    || !LIMIT.test(limit)
    || (minPrice !== null && (!POSITIVE_INTEGER_DECIMAL.test(minPrice) || Number(minPrice) > MAX_POSTGRES_INTEGER))
  ) {
    return { error: 'invalid query parameters' };
  }

  return { tenantId, status, minPrice: minPrice === null ? null : Number(minPrice), limit: Number(limit) };
};

const server = http.createServer(async (request, response) => {
  try {
    if (request.method === 'GET' && requestPath(request) === '/health') {
      await pool.query('select 1');
      return json(response, 200, { status: 'ok' });
    }
    if (request.method === 'GET' && requestPath(request) === '/scenario-e/items') {
      const parameters = scenarioEItemsRequest(request);
      if ('error' in parameters) return json(response, 400, { error: parameters.error });

      const query = bindNamedParameters(SELECT_SCENARIO_E_ITEMS, parameters);
      const result = await pool.query(query);
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
