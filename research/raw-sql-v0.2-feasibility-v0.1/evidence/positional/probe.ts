import assert from 'node:assert/strict';
import pg from 'pg';
import { listWorkItemsSql } from './ListWorkItems.sql.js';

function bindListWorkItems({ tenantId, status, pageSize }: {
  tenantId?: string;
  status?: string | null;
  pageSize: number;
}) {
  if (!tenantId || !Number.isInteger(pageSize) || pageSize < 1) {
    throw new Error('tenantId and positive integer pageSize are required');
  }
  return [tenantId, status ?? null, pageSize];
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
try {
  const tenantId = '11111111-1111-1111-1111-111111111111';
  const open = await client.query({ text: listWorkItemsSql, values: bindListWorkItems({ tenantId, status: 'open', pageSize: 10 }) });
  assert.deepEqual(open.rows, [{ id: 1, status: 'open', title: 'first' }]);
  const all = await client.query({ text: listWorkItemsSql, values: bindListWorkItems({ tenantId, status: null, pageSize: 1 }) });
  assert.deepEqual(all.rows, [{ id: 1, status: 'open', title: 'first' }]);
  assert.throws(() => bindListWorkItems({ status: 'open', pageSize: 1 }), /tenantId/);
  console.log('POSITIONAL_PROBE_PASS');
} finally {
  await client.end();
}
