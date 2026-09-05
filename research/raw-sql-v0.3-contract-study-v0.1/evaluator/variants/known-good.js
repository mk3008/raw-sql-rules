import http from 'node:http';
import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const port = Number(process.env.PORT ?? 3000);
const send = (res, status, body) => { res.writeHead(status, { 'content-type': 'application/json' }); res.end(JSON.stringify(body)); };
const fail = (res, message = 'invalid request') => send(res, 400, { error: message });
const finite = (value, choices) => Object.prototype.hasOwnProperty.call(choices, value) ? choices[value] : null;
const rows = (result) => result.rows.map((row) => ({ ...row, createdAt: row.created_at ?? undefined, tenantId: row.tenant_id ?? undefined }));

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? '/', 'http://127.0.0.1');
    if (req.method === 'GET' && url.pathname === '/health') { await pool.query('select 1'); return send(res, 200, { status: 'ok' }); }
    const tenantId = url.searchParams.get('tenantId');
    if (!tenantId || !['tenant-a', 'tenant-b'].includes(tenantId)) return fail(res, 'unknown tenant');

    if (req.method === 'GET' && url.pathname === '/scenario-a/items') {
      const sort = finite(url.searchParams.get('sort'), { name: 'name', price: 'price', created_at: 'created_at' });
      const direction = finite(url.searchParams.get('direction') ?? 'asc', { asc: 'ASC', desc: 'DESC' });
      if (!sort || !direction) return fail(res, 'unsupported sort');
      const result = await pool.query(`SELECT id, tenant_id, name, price, status, created_at FROM items WHERE tenant_id = $1 ORDER BY ${sort} ${direction}`, [tenantId]);
      return send(res, 200, rows(result));
    }
    if (req.method === 'GET' && url.pathname === '/scenario-b/items') {
      const status = url.searchParams.get('status');
      if (status !== null && !['active', 'inactive', 'archived'].includes(status)) return fail(res, 'unsupported status');
      const result = await pool.query('SELECT id, tenant_id, name, price, status, created_at FROM items WHERE tenant_id = $1 AND ($2::text IS NULL OR status = $2) ORDER BY created_at', [tenantId, status]);
      return send(res, 200, rows(result));
    }
    if (req.method === 'GET' && url.pathname === '/scenario-c/items') {
      const sort = finite(url.searchParams.get('sort') ?? 'name', { name: 'name', price: 'price', created_at: 'created_at' });
      const status = url.searchParams.get('status');
      if (!sort || (status !== null && !['active', 'inactive', 'archived'].includes(status))) return fail(res, 'unsupported selection');
      const result = await pool.query(`SELECT id, tenant_id, name, price, status, created_at FROM items WHERE tenant_id = $1 AND ($2::text IS NULL OR status = $2) ORDER BY ${sort}`, [tenantId, status]);
      return send(res, 200, rows(result));
    }
    if (req.method === 'GET' && url.pathname === '/scenario-d/reports') {
      const report = url.searchParams.get('report');
      const source = finite(report, { summary: 'SELECT id, name FROM items WHERE tenant_id = $1 ORDER BY name', detailed: 'SELECT id, name, price, status FROM items WHERE tenant_id = $1 ORDER BY name' });
      if (!source) return fail(res, 'unsupported report');
      const result = await pool.query(source, [tenantId]);
      return send(res, 200, result.rows);
    }
    if (req.method === 'GET' && url.pathname === '/scenario-e/items') {
      const status = url.searchParams.get('status');
      const rawLimit = url.searchParams.get('limit') ?? '50';
      const limit = /^([1-9]|[1-4][0-9]|50)$/.test(rawLimit) ? Number(rawLimit) : null;
      if (limit === null || (status !== null && !['active', 'inactive', 'archived'].includes(status))) return fail(res, 'unsupported boundary value');
      const result = await pool.query('SELECT id, tenant_id, name, price, status, created_at FROM items WHERE tenant_id = $1 AND ($2::text IS NULL OR status = $2) ORDER BY created_at LIMIT $3', [tenantId, status, limit]);
      return send(res, 200, rows(result));
    }
    return send(res, 404, { error: 'not found' });
  } catch (error) { return send(res, 500, { error: error instanceof Error ? error.message : String(error) }); }
});
server.listen(port, '127.0.0.1');
const shutdown = async () => { await pool.end(); server.close(); };
process.once('SIGTERM', shutdown); process.once('SIGINT', shutdown);
