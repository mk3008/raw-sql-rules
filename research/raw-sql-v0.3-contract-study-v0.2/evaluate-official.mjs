import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { evaluate } from './evaluator/run.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)));
const slot = process.argv[2];
if (!slot || !/^[A-E]-(control|treatment)-[12]$/.test(slot)) throw new Error('usage: node evaluate-official.mjs <slot>');
const evidence = join(root, 'evidence', 'official-runs', slot);
const launch = JSON.parse(await readFile(join(evidence, 'launch.json'), 'utf8'));
const result = await evaluate(slot[0], join(evidence, 'final-source'), { json: false });
await writeFile(join(evidence, 'evaluation.json'), `${JSON.stringify({ slot, launch, evaluator: result }, null, 2)}\n`);
process.stdout.write(`${JSON.stringify({ slot, primary: result.primary })}\n`);
process.exitCode = result.primary === 'PASS' ? 0 : 1;
