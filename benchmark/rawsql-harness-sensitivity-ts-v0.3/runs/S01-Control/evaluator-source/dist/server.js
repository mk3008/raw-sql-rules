import express from 'express';
import { Pool } from 'pg';
const app = express();
const database = new Pool({ connectionString: process.env.DATABASE_URL });
app.use(express.json());
app.get('/health', (_request, response) => response.status(200).json({ status: 'ok' }));
app.get('/inventory-items/stats', async (_request, response, next) => {
    try {
        const result = await database.query(`
      SELECT
        COUNT(*) AS "activeCount",
        COALESCE(SUM(quantity), 0) AS "totalQuantity",
        MAX(created_at) AS "newestCreatedAt"
      FROM inventory_items
      WHERE is_active = TRUE
    `);
        const stats = result.rows[0];
        response.status(200).json({
            activeCount: Number(stats.activeCount),
            totalQuantity: Number(stats.totalQuantity),
            newestCreatedAt: stats.newestCreatedAt?.toISOString() ?? null,
        });
    }
    catch (error) {
        next(error);
    }
});
app.listen(Number(process.env.PORT ?? 3000));
