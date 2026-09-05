import http from 'node:http';
import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const port = Number(process.env.PORT ?? 3000);
const send = (res, status, body) => { res.writeHead(status, { 'content-type': 'application/json' }); res.end(JSON.stringify(body)); };
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? '/', 'http://127.0.0.1');
    if (url.pathname === '/health') return send(res, 200, { status: 'ok' });
    const tenantId = url.searchParams.get('tenantId');
    if (url.pathname === '/scenario-a/items') {
      const sql = `SELECT id, tenant_id, name, price, status, created_at FROM items WHERE tenant_id = '${tenantId}' ORDER BY ${url.searchParams.get('sort')} ${url.searchParams.get('direction')}`;
      return send(res, 200, (await pool.query(sql)).rows);
    }
    if (url.pathname === '/scenario-b/items') return send(res, 403, { error: 'filters disabled' });
    if (url.pathname === '/scenario-c/items') {
      const status = url.searchParams.get('status');
      const sql = `SELECT id, tenant_id, name, price, status, created_at FROM items WHERE tenant_id = '${tenantId}' AND status = '${status}' ORDER BY ${url.searchParams.get('sort')}`;
      return send(res, 200, (await pool.query(sql)).rows);
    }
    if (url.pathname === '/scenario-d/reports') {
      const sql = `SELECT ${url.searchParams.get('report')} FROM items WHERE tenant_id = '${tenantId}'`;
      return send(res, 200, (await pool.query(sql)).rows);
    }
    if (url.pathname === '/scenario-e/items') {
      const sql = `SELECT id, tenant_id, name, price, status, created_at FROM items WHERE tenant_id = '${tenantId}' AND status = '${url.searchParams.get('status')}' LIMIT ${url.searchParams.get('limit')}`;
      return send(res, 200, (await pool.query(sql)).rows);
    }
    return send(res, 404, { error: 'not found' });
  } catch (error) { return send(res, 500, { error: error instanceof Error ? error.message : String(error) }); }
});
server.listen(port, '127.0.0.1');
