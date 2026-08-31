import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';

const directory = path.dirname(fileURLToPath(import.meta.url));
const read = (relative) => fs.readFile(path.join(directory, relative), 'utf8');
const [schemaSql, seedSql, listSql] = await Promise.all([
  read('schema/work_items.sql'),
  read('seed-work-item.sql'),
  read('queries/list-work-items.sql'),
]);
const connection = await mysql.createConnection({
  host: process.env.RAW_SQL_RULES_MYSQL_HOST ?? '127.0.0.1',
  port: Number(process.env.RAW_SQL_RULES_MYSQL_PORT ?? 33306),
  user: process.env.RAW_SQL_RULES_MYSQL_USER ?? 'raw_sql_rules',
  password: process.env.RAW_SQL_RULES_MYSQL_PASSWORD ?? 'raw_sql_rules',
  database: process.env.RAW_SQL_RULES_MYSQL_DATABASE ?? 'raw_sql_rules',
  namedPlaceholders: true,
});
const ownerId = 2147480000 - (process.pid % 1000);
try {
  await connection.query('DROP TABLE IF EXISTS work_items');
  await connection.query(schemaSql);
  await connection.beginTransaction();
  await connection.execute(seedSql, { ownerId, title: 'example item', state: 'open', priority: 7, amount: '12.50', updatedAt: '2026-08-30 12:34:56' });
  const [rows] = await connection.execute(listSql, { ownerId, state: null });
  assert.equal(rows.length, 1);
  assert.equal(rows[0].title, 'example item');
  assert.equal(rows[0].amount, '12.50');
  assert.ok(rows[0].updated_at instanceof Date);
  assert.equal(typeof rows[0].id, 'number');
  console.log('PASS: native mysql2 execution returned expected values and runtime types');
  await connection.rollback();
} finally {
  await connection.end();
}
