import { access, mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)));
const run = (slot, env) => new Promise((resolveRun, rejectRun) => {
  const child = spawn('node', ['launch.mjs', slot, '--preflight-only'], { cwd: root, env: { ...process.env, ...env }, shell: false });
  let stdout = ''; let stderr = '';
  child.stdout.on('data', (chunk) => { stdout += chunk; });
  child.stderr.on('data', (chunk) => { stderr += chunk; });
  child.on('error', rejectRun);
  child.on('close', (code) => resolveRun({ code, stdout, stderr }));
});
const exists = async (path) => access(path).then(() => true).catch(() => false);
const sentinel = join(root, 'evidence', 'preflight', 'codex-spawn-sentinel.txt');
const goodEvidence = join(root, 'evidence', 'preflight', 'A-control-1');
await rm(sentinel, { force: true });
// Preflight evidence is a refreshable gate artifact, never an official run artifact.
await rm(goodEvidence, { recursive: true, force: true });
const good = await run('A-control-1', { LAUNCH_SENTINEL: sentinel });
if (good.code !== 0 || !(await exists(join(goodEvidence, 'preflight.json'))) || await exists(sentinel)) {
  throw new Error(`external fresh-repository preflight failed: ${good.stderr}`);
}
const parentCandidate = join(root, 'evidence', 'preflight-parent-reference');
await mkdir(parentCandidate, { recursive: true });
const bad = await run('B-control-1', { CANDIDATE_ROOT_OVERRIDE: parentCandidate, LAUNCH_SENTINEL: sentinel, GIT_DIR: join(root, '.git') });
if (bad.code === 0 || await exists(sentinel)) {
  throw new Error(`parent-repository reference was not rejected before candidate launch: ${bad.stdout} ${bad.stderr}`);
}
await rm(parentCandidate, { recursive: true, force: true });
const result = {
  result: 'PASS',
  goodPreflight: true,
  parentReferenceRejectedBeforeSpawn: true,
  goodExitCode: good.code,
  parentReferenceExitCode: bad.code,
  sentinelCreated: false,
  testedAt: new Date().toISOString(),
};
await writeFile(join(root, 'evidence', 'preflight', 'isolation-regression.json'), `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result));
