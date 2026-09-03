import assert from 'node:assert/strict';
import { runPipeline } from './pipeline.mjs';
assert.equal(runPipeline({ sku: 'A', quantity: 1 }).status, 'available');
assert.equal(runPipeline({ sku: 'B', quantity: 0 }).status, 'sold-out');
