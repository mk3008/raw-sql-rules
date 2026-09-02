import express from 'express';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { Pool } from 'pg';
const app = express();
app.use(express.json());
app.get('/health', (_request, response) => response.status(200).json({ status: 'ok' }));
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const queryDirectory = path.resolve(process.cwd(), 'database', 'queries', 'reservations');
const sql = {
    acquireRequestLock: readFileSync(path.join(queryDirectory, 'acquire-request-lock.sql'), 'utf8'),
    findByRequestId: readFileSync(path.join(queryDirectory, 'find-by-request-id.sql'), 'utf8'),
    lockInventoryItem: readFileSync(path.join(queryDirectory, 'lock-inventory-item.sql'), 'utf8'),
    decrementInventory: readFileSync(path.join(queryDirectory, 'decrement-inventory.sql'), 'utf8'),
    createReservation: readFileSync(path.join(queryDirectory, 'create-reservation.sql'), 'utf8'),
    createReservedEvent: readFileSync(path.join(queryDirectory, 'create-reserved-event.sql'), 'utf8'),
};
function bind(sqlText, parameters) {
    const values = [];
    const positions = new Map();
    const text = sqlText.replace(/:([a-z_]+)/g, (_placeholder, name) => {
        const value = parameters[name];
        if (value === undefined) {
            throw new Error(`Missing SQL parameter: ${name}`);
        }
        let position = positions.get(name);
        if (position === undefined) {
            values.push(value);
            position = values.length;
            positions.set(name, position);
        }
        return `$${position}`;
    });
    return { text, values };
}
function isUuid(value) {
    return typeof value === 'string'
        && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}
function isPositiveInteger(value) {
    return typeof value === 'number' && Number.isSafeInteger(value) && value > 0;
}
function toResponse(reservation) {
    return {
        requestId: reservation.request_id,
        inventoryItemId: reservation.inventory_item_id,
        quantity: reservation.quantity,
    };
}
async function rollback(client) {
    await client.query('ROLLBACK');
}
app.post('/inventory-items/:id/reserve', async (request, response, next) => {
    const { requestId, quantity } = (request.body ?? {});
    if (!isUuid(request.params.id) || !isUuid(requestId) || !isPositiveInteger(quantity)) {
        response.sendStatus(400);
        return;
    }
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query(bind(sql.acquireRequestLock, { request_id: requestId }));
        const existing = await client.query(bind(sql.findByRequestId, { request_id: requestId }));
        if (existing.rowCount === 1) {
            await client.query('COMMIT');
            response.status(200).json(toResponse(existing.rows[0]));
            return;
        }
        const item = await client.query(bind(sql.lockInventoryItem, { inventory_item_id: request.params.id }));
        if (item.rowCount === 0) {
            await rollback(client);
            response.sendStatus(404);
            return;
        }
        const decremented = await client.query(bind(sql.decrementInventory, {
            inventory_item_id: request.params.id,
            quantity,
        }));
        if (decremented.rowCount === 0) {
            await rollback(client);
            response.sendStatus(409);
            return;
        }
        const reservation = await client.query(bind(sql.createReservation, {
            request_id: requestId,
            inventory_item_id: request.params.id,
            quantity,
        }));
        await client.query(bind(sql.createReservedEvent, {
            request_id: requestId,
            inventory_item_id: request.params.id,
            quantity,
        }));
        await client.query('COMMIT');
        response.status(201).json(toResponse(reservation.rows[0]));
    }
    catch (error) {
        try {
            await rollback(client);
        }
        catch {
            // The original database error is more useful to Express error handling.
        }
        next(error);
    }
    finally {
        client.release();
    }
});
app.listen(Number(process.env.PORT ?? 3000));
