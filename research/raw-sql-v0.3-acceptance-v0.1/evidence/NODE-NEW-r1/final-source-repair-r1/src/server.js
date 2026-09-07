import http from 'node:http';
import pg from 'pg';
import { acceptanceItemsSql } from './acceptance-items.sql.js';
import { lowerNamedQuery } from './named-query.js';

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
const allowedItemParameters = new Set(['tenantId', 'status', 'limit']);
const itemStatuses = new Set(['active', 'inactive', 'archived']);

const invalidRequest = (message) => ({ status: 400, body: { error: message } });

const itemQueryBindings = (request) => {
  const url = new URL(request.url ?? '/', 'http://127.0.0.1');
  for (const name of url.searchParams.keys()) {
    if (!allowedItemParameters.has(name)) return invalidRequest('unknown query parameter');
    if (url.searchParams.getAll(name).length !== 1) return invalidRequest('duplicate query parameter');
  }

  const tenantId = url.searchParams.get('tenantId');
  if (tenantId === null || !/^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/.test(tenantId)) {
    return invalidRequest('tenantId must be a single valid identifier');
  }

  const status = url.searchParams.get('status');
  if (status !== null && !itemStatuses.has(status)) return invalidRequest('invalid status');

  const limitValue = url.searchParams.get('limit');
  if (limitValue !== null && !/^[1-9][0-9]*$/.test(limitValue)) {
    return invalidRequest('limit must be a positive integer');
  }
  const limit = limitValue === null ? 50 : Number(limitValue);
  if (!Number.isSafeInteger(limit) || limit > 50) return invalidRequest('limit must be between 1 and 50');

  return { bindings: { tenantId, status, limit } };
};

const server = http.createServer(async (request, response) => {
  try {
    if (request.method === 'GET' && requestPath(request) === '/health') {
      await pool.query('select 1');
      return json(response, 200, { status: 'ok' });
    }
    if (request.method === 'GET' && requestPath(request) === '/acceptance/items') {
      const parsed = itemQueryBindings(request);
      if ('status' in parsed) return json(response, parsed.status, parsed.body);
      const result = await pool.query(lowerNamedQuery(acceptanceItemsSql, parsed.bindings));
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
