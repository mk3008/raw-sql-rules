import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { randomUUID } from 'node:crypto';
import pg from 'pg';
import { createApp } from '../dist/server.js';

const { Client } = pg;

const databaseUrl = process.env.DATABASE_URL;

test('GET /inventory-items/stats returns active-item aggregates and an empty result', async (t) => {
  assert.ok(databaseUrl, 'DATABASE_URL must be set to run integration tests');

  const client = new Client({ connectionString: databaseUrl });
  const schema = `inventory_stats_test_${randomUUID().replaceAll('-', '')}`;
  let server;

  try {
    await client.connect();
    await client.query(`CREATE SCHEMA "${schema}"`);
    await client.query('SELECT set_config($1, $2, false)', ['search_path', schema]);
    await client.query(await readFile(new URL('../database/schema/001_inventory.sql', import.meta.url), 'utf8'));
    await client.query(
      `INSERT INTO inventory_items (id, sku, quantity, is_active, created_at) VALUES
        ($1, $2, $3, $4, $5),
        ($6, $7, $8, $9, $10),
        ($11, $12, $13, $14, $15)`,
      [
        '11111111-1111-1111-1111-111111111111', 'ACTIVE-A', 7, true, '2024-01-02T03:04:05Z',
        '22222222-2222-2222-2222-222222222222', 'ACTIVE-B', 5, true, '2024-03-01T00:00:00Z',
        '33333333-3333-3333-3333-333333333333', 'INACTIVE', 99, false, '2025-01-01T00:00:00Z',
      ],
    );

    server = createApp(client).listen(0, '127.0.0.1');
    await new Promise((resolve) => server.once('listening', resolve));
    const { port } = server.address();
    const getStats = async () => {
      const response = await fetch(`http://127.0.0.1:${port}/inventory-items/stats`);
      assert.equal(response.status, 200);
      return response.json();
    };

    assert.deepEqual(await getStats(), {
      activeCount: 2,
      totalQuantity: 12,
      newestCreatedAt: '2024-03-01T00:00:00.000Z',
    });

    await client.query('UPDATE inventory_items SET is_active = FALSE');
    assert.deepEqual(await getStats(), {
      activeCount: 0,
      totalQuantity: 0,
      newestCreatedAt: null,
    });
  } finally {
    if (server) {
      await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    }
    if (client) {
      await client.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`).catch(() => {});
      await client.end();
    }
  }
});
