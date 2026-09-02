import express from 'express';
import pg from 'pg';
const { Pool } = pg;
const app = express(), pool = new Pool({ connectionString: process.env.DATABASE_URL });
app.use(express.json());
app.get('/health', (_, r) => r.json({ status: 'ok' }));
app.post('/inventory-items/:id/reserve', async (q, r) => { const { requestId, quantity } = q.body ?? {}; if (!Number.isInteger(quantity) || quantity <= 0)
    return r.sendStatus(400); const c = await pool.connect(); try {
    await c.query('begin');
    const item = await c.query('select quantity from inventory_items where id=$1 ', [q.params.id]);
    if (!item.rowCount) {
        await c.query('rollback');
        return r.sendStatus(404);
    }
    const reservation = await c.query('insert into inventory_reservations(request_id,inventory_item_id,quantity) values($1,$2,$3) on conflict (request_id) do update set quantity=excluded.quantity returning request_id', [requestId, q.params.id, quantity]);
    if (!reservation.rowCount) {
        await c.query('commit');
        return r.sendStatus(200);
    }
    if (item.rows[0].quantity < quantity) {
        await c.query('rollback');
        return r.sendStatus(409);
    }
    await c.query('update inventory_items set quantity=quantity-$1 where id=$2', [quantity, q.params.id]);
    await c.query("insert into inventory_events(request_id,inventory_item_id,event_type,quantity) values($1,$2,'reserved',$3)", [requestId, q.params.id, quantity]);
    await c.query('commit');
    return r.sendStatus(201);
}
catch (e) {
    await c.query('rollback');
    throw e;
}
finally {
    c.release();
} });
app.listen(Number(process.env.PORT ?? 3000));
