import assert from 'node:assert/strict';
import pg from 'pg';
import { lowerNamedQuery } from './named-query.js';

const bindings = { first: "'); DROP TABLE items; --", second: 7 };
const expectLowering = (sql, expectedText, expectedValues) => {
  assert.deepEqual(lowerNamedQuery(sql, bindings), { text: expectedText, values: expectedValues });
};

// Addition, removal, reordering, and repetition retain SQL-derived value order.
expectLowering('SELECT :first', 'SELECT $1', [bindings.first]);
expectLowering('SELECT :first, :second', 'SELECT $1, $2', [bindings.first, bindings.second]);
expectLowering('SELECT :second, :first', 'SELECT $1, $2', [bindings.second, bindings.first]);
expectLowering('SELECT :first, :first', 'SELECT $1, $2', [bindings.first, bindings.first]);
assert.throws(() => lowerNamedQuery('SELECT :missing', bindings), /Missing SQL binding: missing/);

const lexicalSql = `
  SELECT :first AS hostile, :second::integer AS second, :first AS repeated,
         ':string' AS string_value, 'cast'::text AS cast_value
  -- :line_comment
  /* :block_comment */
`;
const lowered = lowerNamedQuery(lexicalSql, bindings);
assert.match(lowered.text, /':string'/);
assert.match(lowered.text, /'cast'::text/);
assert.match(lowered.text, /-- :line_comment/);
assert.match(lowered.text, /\/\* :block_comment \*\//);
assert.deepEqual(lowered.values, [bindings.first, bindings.second, bindings.first]);

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL ?? 'postgres://postgres:postgres@127.0.0.1:55432/contract_study'
});
try {
  const result = await pool.query(lowered);
  assert.equal(result.rows[0].hostile, bindings.first);
  assert.equal(result.rows[0].second, bindings.second);
  assert.equal(result.rows[0].repeated, bindings.first);
  console.log('named-query verification passed');
} finally {
  await pool.end();
}
