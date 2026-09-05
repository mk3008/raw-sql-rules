import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)));
const slot = process.argv[2];
if (!slot || !/^[A-E]-(control|treatment)-[12]$/.test(slot)) {
  throw new Error('usage: node launch.mjs <A|B|C|D|E>-<control|treatment>-<1|2>');
}
const [scenario, arm] = slot.split('-');
const frozen = JSON.parse(await readFile(join(root, 'FROZEN-MANIFEST.json'), 'utf8'));
const tasks = JSON.parse(await readFile(join(root, 'candidate-tasks.json'), 'utf8'));
const packet = await readFile(join(root, 'packets', `${arm}-AGENTS.md`), 'utf8');
const evidence = join(root, 'evidence', 'official-runs', slot);
const candidate = join(evidence, 'candidate');
await rm(evidence, { recursive: true, force: true });
await mkdir(evidence, { recursive: true });
await cp(join(root, 'fixture'), candidate, { recursive: true, filter: (source) => !/[\\/]node_modules([\\/]|$)/.test(source) });
await writeFile(join(candidate, 'AGENTS.md'), packet);
await writeFile(join(candidate, 'TASK.md'), `${tasks[scenario]}\n`);
const command = 'Read AGENTS.md and TASK.md. Implement the requested functionality in the fixture. Preserve the database schema and package files. Do not inspect, edit, or add policy documents. You may run local checks. Do not commit. When finished, report the work performed.';
const args = ['exec', '--ephemeral', '--json', '-m', frozen.profile.model, '-c', `model_reasoning_effort="${frozen.profile.reasoningEffort}"`, '--approve-for-me', '-C', candidate, '--skip-git-repo-check', command];
const startedAt = new Date().toISOString();
const child = spawn('codex', args, { cwd: candidate, shell: false, env: process.env });
child.stdin.end();
let jsonl = '';
let stderr = '';
child.stdout.on('data', (chunk) => { jsonl += chunk; });
child.stderr.on('data', (chunk) => { stderr += chunk; });
const result = await new Promise((resolveRun, rejectRun) => {
  child.on('error', rejectRun);
  child.on('close', (code, signal) => resolveRun({ code, signal }));
});
const endedAt = new Date().toISOString();
await writeFile(join(evidence, 'events.jsonl'), jsonl);
await writeFile(join(evidence, 'stderr.txt'), stderr);
await writeFile(join(evidence, 'launch.json'), `${JSON.stringify({ slot, scenario, arm, startedAt, endedAt, result, frozenManifestSha256: createHash('sha256').update(await readFile(join(root, 'FROZEN-MANIFEST.json'))).digest('hex') }, null, 2)}\n`);
process.stdout.write(`${JSON.stringify({ slot, scenario, arm, ...result, evidence })}\n`);
process.exitCode = result.code === 0 ? 0 : 1;
