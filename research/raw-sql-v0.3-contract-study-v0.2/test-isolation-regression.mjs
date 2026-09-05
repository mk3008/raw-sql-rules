import { access, mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)));
const run = (slot, env, preflightOnly = true) => new Promise((resolveRun, rejectRun) => {
  const args = ['launch.mjs', slot];
  if (preflightOnly) args.push('--preflight-only');
  const child = spawn('node', args, { cwd: root, env: { ...process.env, ...env }, shell: false });
  let stdout = ''; let stderr = '';
  child.stdout.on('data', (chunk) => { stdout += chunk; });
  child.stderr.on('data', (chunk) => { stderr += chunk; });
  child.on('error', rejectRun);
  child.on('close', (code) => resolveRun({ code, stdout, stderr }));
});
const exists = async (path) => access(path).then(() => true).catch(() => false);
const treeDigest = async (path) => {
  const entries = [];
  const collect = async (current, relative = '') => {
    for (const entry of await readdir(current, { withFileTypes: true })) {
      const child = join(current, entry.name);
      const childRelative = join(relative, entry.name).replaceAll('\\', '/');
      if (entry.isDirectory()) await collect(child, childRelative);
      else if ((await stat(child)).isFile()) entries.push(`${childRelative}:${createHash('sha256').update(await readFile(child)).digest('hex')}`);
    }
  };
  await collect(path);
  return createHash('sha256').update(entries.sort().join('\n')).digest('hex');
};
const sentinel = join(root, 'evidence', 'preflight', 'codex-spawn-sentinel.txt');
const goodEvidence = join(root, 'evidence', 'preflight', 'A-control-1');
const replacement = 'A-control-1-replacement-1';
const replacementEvidence = join(root, 'evidence', 'preflight', replacement);
const originalOfficialEvidence = join(root, 'evidence', 'official-runs', 'A-control-1');
const originalDigest = await treeDigest(originalOfficialEvidence);
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
await rm(replacementEvidence, { recursive: true, force: true });
const replacementPreflight = await run(replacement, { LAUNCH_SENTINEL: sentinel });
if (replacementPreflight.code !== 0 || !(await exists(join(replacementEvidence, 'preflight.json'))) || await exists(sentinel)) {
  throw new Error(`approved replacement was not preflightable without a model launch: ${replacementPreflight.stderr}`);
}
const duplicateNormal = await run('A-control-1', { LAUNCH_SENTINEL: sentinel }, false);
if (duplicateNormal.code === 0 || await exists(sentinel)) {
  throw new Error(`existing normal official slot was not rejected before model launch: ${duplicateNormal.stdout} ${duplicateNormal.stderr}`);
}
const unapprovedReplacement = await run('A-control-1-replacement-2', { LAUNCH_SENTINEL: sentinel }, false);
if (unapprovedReplacement.code === 0 || await exists(sentinel)) {
  throw new Error(`unapproved replacement was not rejected before model launch: ${unapprovedReplacement.stdout} ${unapprovedReplacement.stderr}`);
}
const originalDigestAfter = await treeDigest(originalOfficialEvidence);
if (originalDigestAfter !== originalDigest) throw new Error('original interrupted attempt evidence changed during replacement regression checks');
const result = {
  result: 'PASS',
  goodPreflight: true,
  parentReferenceRejectedBeforeSpawn: true,
  goodExitCode: good.code,
  parentReferenceExitCode: bad.code,
  approvedReplacementPreflight: true,
  duplicateNormalRejectedBeforeSpawn: true,
  unapprovedReplacementRejectedBeforeSpawn: true,
  originalEvidenceUnchanged: true,
  sentinelCreated: false,
  testedAt: new Date().toISOString(),
};
await writeFile(join(root, 'evidence', 'preflight', 'isolation-regression.json'), `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result));
