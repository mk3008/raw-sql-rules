import express from 'express';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import pg, { type Pool as PgPool, type QueryResultRow } from 'pg';

const { Pool } = pg;

const inventoryItemsStatsSql = await readFile(
  new URL('./sql/inventory-items-stats.sql', import.meta.url),
  'utf8',
);

type Database = Pick<PgPool, 'query'>;

interface InventoryItemsStatsRow extends QueryResultRow {
  activeCount: string;
  totalQuantity: string;
  newestCreatedAt: Date | null;
}

export function createApp(database: Database) {
  const app = express();
  app.use(express.json());
  app.get('/health', (_request, response) => response.status(200).json({ status: 'ok' }));
  app.get('/inventory-items/stats', async (_request, response, next) => {
    try {
      const result = await database.query<InventoryItemsStatsRow>(inventoryItemsStatsSql);
      const stats = result.rows[0];

      response.status(200).json({
        activeCount: Number(stats.activeCount),
        totalQuantity: Number(stats.totalQuantity),
        newestCreatedAt: stats.newestCreatedAt?.toISOString() ?? null,
      });
    } catch (error) {
      next(error);
    }
  });
  return app;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const database = new Pool({ connectionString: process.env.DATABASE_URL });
  const app = createApp(database);
  app.listen(Number(process.env.PORT ?? 3000));
}
