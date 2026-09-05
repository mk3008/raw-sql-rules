import { readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { verify } from './posthoc-verifier.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)));
const evidence = join(root, 'evidence', 'official-runs');
const excluded = new Set(['A-control-1']);
const entries = (await readdir(evidence)).filter((slot) => !excluded.has(slot)).sort();
const results = [];
for (const slot of entries) {
  const launch = JSON.parse(await readFile(join(evidence, slot, 'launch.json'), 'utf8'));
  const result = await verify(launch.scenario, join(evidence, slot, 'final-source'));
  results.push({ slot, arm: launch.arm, scenario: launch.scenario, result });
  console.log(JSON.stringify({ slot, result: result.result }));
}
const output = { analysis: 'post-hoc; not part of frozen Primary', evaluated: results.length, results };
await writeFile(join(root, 'posthoc-results.json'), `${JSON.stringify(output, null, 2)}\n`);
if (results.some((item) => item.result.result !== 'PASS')) process.exitCode = 1;
