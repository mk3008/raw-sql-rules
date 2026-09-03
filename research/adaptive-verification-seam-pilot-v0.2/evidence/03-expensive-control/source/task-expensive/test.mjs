import assert from 'node:assert/strict';
import { runPipeline } from './pipeline.mjs';
assert.equal((await runPipeline({ id: 'B', completed: false })).status, 'pending');
assert.equal((await runPipeline({ id: 'A', completed: true })).status, 'complete');
