import assert from 'node:assert/strict';
import pg from 'pg';
import { bindNamedParameters } from './src/named-parameters.js';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
try {
  const query = bindNamedParameters(`
    SELECT :second::integer + :first::integer + :first::integer AS total,
      ':stringMarker' AS literal
    -- :lineMarker
    /* :blockMarker */
  `, { first: 3, second: 2 });
  const result = await pool.query(query);
  assert.equal(result.rows[0].total, 8);
  assert.equal(result.rows[0].literal, ':stringMarker');

  const hostile = "'; DROP TABLE items; --";
  const hostileResult = await pool.query(bindNamedParameters('SELECT :value::text AS value', { value: hostile }));
  assert.equal(hostileResult.rows[0].value, hostile);
  assert.throws(() => bindNamedParameters('SELECT :missing', {}), /missing SQL binding: missing/);
  console.log('PostgreSQL/node-postgres named parameter verification passed');
} finally {
  await pool.end();
}
