import assert from 'node:assert/strict';
import { bindNamedParameters } from './src/named-parameters.js';

const sql = `
  SELECT :second::integer + :first::integer + :first::integer AS total,
    ':stringMarker' AS literal, "quoted:identifier" AS label,
    $$:dollarMarker$$ AS dollar_literal
  -- :lineMarker
  /* outer :blockMarker /* nested :nestedMarker */ still a comment */
`;
const hostile = "'; DROP TABLE items; --";
const query = bindNamedParameters(sql, { first: hostile, second: 2 });
assert.match(query.text, /\$1::integer \+ \$2::integer \+ \$3::integer/);
assert.match(query.text, /':stringMarker'/);
assert.match(query.text, /-- :lineMarker/);
assert.match(query.text, /:blockMarker/);
assert.deepEqual(query.values, [2, hostile, hostile]);
assert.deepEqual(bindNamedParameters('SELECT :added, :kept', { added: 1, kept: 2 }).values, [1, 2]);
assert.deepEqual(bindNamedParameters('SELECT :kept', { kept: 2 }).values, [2]);
assert.throws(() => bindNamedParameters('SELECT :missing', {}), /missing SQL binding: missing/);
console.log('named parameter lowering verified');
