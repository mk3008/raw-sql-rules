import http from 'node:http';
import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL ?? 'postgres://postgres:postgres@127.0.0.1:55432/contract_study'
});
const port = Number(process.env.PORT ?? 3000);

// These are the only application-controlled report shapes. In particular, the
// report_configs.stored_text fixture is descriptive data, not executable SQL.
const reportQueries = Object.freeze({
  summary: `
    SELECT id, name
    FROM items
    WHERE tenant_id = /* tenantId */ $1
    ORDER BY name ASC
  `,
  detailed: `
    SELECT id, name, price, status
    FROM items
    WHERE tenant_id = /* tenantId */ $1
    ORDER BY name ASC
  `
});

const json = (response, status, body) => {
  response.writeHead(status, { 'content-type': 'application/json' });
  response.end(JSON.stringify(body));
};
const requestPath = (request) => new URL(request.url ?? '/', 'http://127.0.0.1').pathname;
const requestUrl = (request) => new URL(request.url ?? '/', 'http://127.0.0.1');

const scenarioDRequest = (request) => {
  const params = requestUrl(request).searchParams;
  const tenantIds = params.getAll('tenantId');
  const reports = params.getAll('report');
  const hasOnlyExpectedParameters = [...params.keys()].every((key) => key === 'tenantId' || key === 'report');

  if (!hasOnlyExpectedParameters || tenantIds.length !== 1 || reports.length !== 1 || tenantIds[0] === '') {
    return null;
  }

  const [tenantId] = tenantIds;
  const [report] = reports;
  if (!Object.hasOwn(reportQueries, report)) {
    return null;
  }

  return { tenantId, report };
};

const server = http.createServer(async (request, response) => {
  try {
    if (request.method === 'GET' && requestPath(request) === '/health') {
      await pool.query('select 1');
      return json(response, 200, { status: 'ok' });
    }
    if (request.method === 'GET' && requestPath(request) === '/scenario-d/reports') {
      const scenario = scenarioDRequest(request);
      if (scenario === null) {
        return json(response, 400, { error: 'tenantId and report must each be provided exactly once' });
      }

      const result = await pool.query(reportQueries[scenario.report], [scenario.tenantId]);
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
