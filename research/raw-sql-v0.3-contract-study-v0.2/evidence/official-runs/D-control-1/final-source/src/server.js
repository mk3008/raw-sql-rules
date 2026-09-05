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
const requestUrl = (request) => new URL(request.url ?? '/', 'http://127.0.0.1');

// These are the only executable report definitions. Keep their projections
// explicit so a request value can never become SQL syntax.
const reportQueries = {
  summary: `
    SELECT id, name
    FROM items
    WHERE tenant_id = $1 -- tenantId
    ORDER BY name ASC
  `,
  detailed: `
    SELECT id, name, price, status
    FROM items
    WHERE tenant_id = $1 -- tenantId
    ORDER BY name ASC
  `
};

const singleQueryValue = (searchParams, name) => {
  const values = searchParams.getAll(name);
  return values.length === 1 && values[0] !== '' ? values[0] : null;
};

const server = http.createServer(async (request, response) => {
  try {
    const url = requestUrl(request);
    if (request.method === 'GET' && url.pathname === '/health') {
      await pool.query('select 1');
      return json(response, 200, { status: 'ok' });
    }
    if (request.method === 'GET' && url.pathname === '/scenario-d/reports') {
      const tenantId = singleQueryValue(url.searchParams, 'tenantId');
      const report = singleQueryValue(url.searchParams, 'report');
      if (!tenantId || !report || !Object.hasOwn(reportQueries, report)) {
        return json(response, 400, { error: 'tenantId and a supported report are required exactly once' });
      }

      const result = await pool.query(reportQueries[report], [tenantId]);
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
