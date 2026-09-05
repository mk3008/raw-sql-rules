import { createHash } from 'node:crypto';
import { readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)));
const digest = (value) => createHash('sha256').update(value).digest('hex');
const files = [];
async function collect(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'evidence' || entry.name === 'FROZEN-MANIFEST.json') continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) await collect(path);
    else if ((await stat(path)).isFile()) files.push(relative(root, path).replaceAll('\\', '/'));
  }
}
await collect(root);
files.sort();
const hashes = Object.fromEntries(await Promise.all(files.map(async (file) => [file, digest(await readFile(join(root, file)))])));
const tasks = JSON.parse(await readFile(join(root, 'TASK-SPECS.json'), 'utf8'));
const materials = {};
for (const scenario of ['A', 'B', 'C', 'D', 'E']) {
  materials[scenario] = {};
  for (const arm of ['control', 'treatment']) {
    const packet = await readFile(join(root, 'packets', `${arm}-AGENTS.md`), 'utf8');
    const task = `${tasks.responseSchema}\n\n${tasks[scenario]}\n`;
    materials[scenario][arm] = {
      fixtureServerSha256: hashes['fixture/src/server.js'],
      packetSha256: digest(packet),
      taskSha256: digest(task)
    };
  }
}
const manifest = {
  studyId: 'raw-sql-v0.3-contract-study-v0.2',
  baselineCommit: 'f742ca1c27d0ddd0b9f464bbc487181a2a64d2d3',
  relationshipToV01: 'v0.1 closed INVALID_OR_INSENSITIVE; its 3 runs are excluded and never re-scored',
  profile: JSON.parse(await readFile(join(root, 'execution-order.json'), 'utf8')).profile,
  officialLaunches: 20,
  files: hashes,
  materialHashes: materials,
  calibration: { required: 'PASS before official launch', results: 'evaluator/calibration-results.json' }
};
await writeFile(join(root, 'FROZEN-MANIFEST.json'), `${JSON.stringify(manifest, null, 2)}\n`);
