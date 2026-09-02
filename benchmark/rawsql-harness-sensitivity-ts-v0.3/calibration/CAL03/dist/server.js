import express from 'express';
import pg from 'pg';
const { Pool } = pg;
const app = express(), pool = new Pool({ connectionString: process.env.DATABASE_URL });
app.use(express.json());
app.get('/health', (_, r) => r.json({ status: 'ok' }));
app.get('/inventory-items/stats', async (_, r) => { const x = (await pool.query('select count(*) as "activeCount", coalesce(sum(quantity),0) as "totalQuantity", max(created_at) as "newestCreatedAt" from inventory_items where is_active')).rows[0]; r.json({ activeCount: x.activeCount, totalQuantity: x.totalQuantity, newestCreatedAt: x.newestCreatedAt?.toISOString() ?? null }); });
app.listen(Number(process.env.PORT ?? 3000));
