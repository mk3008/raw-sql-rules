import { cp, mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { command, preflight, readRuntimeVerifier, safeEnvironment, writeJson, writeRuntimeVerifier } from './isolation.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)));
const protectedRepositoryRoot = resolve(root, '..', '..');
const slot = process.argv[2];
const preflightOnly = process.argv.includes('--preflight-only');
const approvedReplacement = 'A-control-1-replacement-1';
const normalSlot = /^[A-E]-(control|treatment)-[12]$/;
if (!slot || (!normalSlot.test(slot) && slot !== approvedReplacement)) throw new Error(`usage: node launch.mjs <A|B|C|D|E>-<control|treatment>-<1|2>|${approvedReplacement}`);
const [scenario, arm] = slot === approvedReplacement ? ['A', 'control'] : slot.split('-');
const frozen = JSON.parse(await readFile(join(root, 'FROZEN-MANIFEST.json'), 'utf8'));
const tasks = JSON.parse(await readFile(join(root, 'TASK-SPECS.json'), 'utf8'));
const packetPath = join(root, 'packets', `${arm}-AGENTS.md`);
const packet = await readFile(packetPath, 'utf8');
const task = `${tasks.responseSchema}\n\n${tasks[scenario]}\n`;
const evidence = join(root, 'evidence', preflightOnly ? 'preflight' : 'official-runs', slot);
if (await exists(evidence)) throw new Error(`evidence already exists for ${slot}; official runs are never replaced`);
await mkdir(evidence, { recursive: true });
const candidate = process.env.CANDIDATE_ROOT_OVERRIDE
  ? resolve(process.env.CANDIDATE_ROOT_OVERRIDE)
  : await mkdtemp(join(tmpdir(), `rawsql-v03r2-${slot}-`));
const env = safeEnvironment(candidate);
const hash = (text) => createHash('sha256').update(text).digest('hex');

async function exists(path) { try { await readFile(path); return true; } catch { try { await (await import('node:fs/promises')).access(path); return true; } catch { return false; } } }
async function git(args, options = {}) {
  const result = await command('git', ['-C', candidate, ...args], { env, ...options });
  if (result.code !== 0) throw new Error(`git ${args.join(' ')} failed: ${result.stderr}`);
  return result.stdout;
}

try {
  if (process.env.CANDIDATE_ROOT_OVERRIDE) await mkdir(candidate, { recursive: true });
  await cp(join(root, 'fixture'), candidate, { recursive: true, filter: (source) => !/[\\/](node_modules|\.git)([\\/]|$)/.test(source) });
  await writeFile(join(candidate, 'AGENTS.md'), packet);
  await writeFile(join(candidate, 'TASK.md'), task);
  await git(['init', '--quiet']);
  await git(['config', 'user.name', 'Raw SQL Study']);
  await git(['config', 'user.email', 'study@example.invalid']);
  await git(['add', '--all']);
  await git(['commit', '--quiet', '--no-gpg-sign', '-m', 'frozen candidate baseline']);
  const initialHead = await git(['rev-parse', 'HEAD']);
  const initialTree = await git(['rev-parse', 'HEAD^{tree}']);
  await writeRuntimeVerifier(candidate, initialHead, initialTree);
  await writeFile(join(candidate, '.git', 'info', 'exclude'), 'verify-isolation.mjs\n');
  const pre = await preflight(candidate, initialHead, initialTree, protectedRepositoryRoot);
  if (!pre.pass) throw new Error(`isolation preflight rejected ${JSON.stringify(pre.checks)}`);
  const fixtureHashes = Object.fromEntries(await Promise.all(Object.entries(frozen.files)
    .filter(([path]) => path.startsWith('fixture/'))
    .map(async ([path, expected]) => [path, { expected, actual: hash(await readFile(join(candidate, path.slice('fixture/'.length)))) }])));
  const tracked = (await git(['ls-files'])).split('\n').filter(Boolean).sort();
  const allowedTracked = [...Object.keys(fixtureHashes).map((path) => path.slice('fixture/'.length)), 'AGENTS.md', 'TASK.md'].sort();
  const fixtureMatchesFreeze = Object.values(fixtureHashes).every(({ expected, actual }) => expected === actual);
  const trackedAllowlistMatches = JSON.stringify(tracked) === JSON.stringify(allowedTracked);
  if (!fixtureMatchesFreeze || !trackedAllowlistMatches) throw new Error('candidate tracked source does not match frozen fixture allowlist');
  const materials = { fixtureServerSha256: fixtureHashes['fixture/src/server.js'].actual, packetSha256: hash(packet), taskSha256: hash(task), fixtureMatchesFreeze, trackedAllowlistMatches };
  if (JSON.stringify({ fixtureServerSha256: materials.fixtureServerSha256, packetSha256: materials.packetSha256, taskSha256: materials.taskSha256 }) !== JSON.stringify(frozen.materialHashes[scenario][arm])) throw new Error('frozen material hash mismatch before candidate launch');
  await writeJson(join(evidence, 'preflight.json'), { slot, scenario, arm, replacementFor: slot === approvedReplacement ? 'A-control-1' : null, candidate, preflight: pre, materials });
  if (preflightOnly) {
    process.stdout.write(`${JSON.stringify({ slot, candidate: basename(candidate), preflight: 'PASS' })}\n`);
    process.exitCode = 0;
  } else {
  const prompt = 'First run `node verify-isolation.mjs` and stop if it fails. Then read AGENTS.md and TASK.md. Implement the requested functionality in this repository only. Preserve schema and package files. Do not inspect or use paths outside this repository. You may run local checks. Do not commit. Report completed work.';
  const args = ['exec', '--ephemeral', '--json', '-m', frozen.profile.model, '-c', `model_reasoning_effort="${frozen.profile.reasoningEffort}"`, '--approve-for-me', '-C', candidate, prompt];
  const startedAt = new Date().toISOString();
  if (process.env.LAUNCH_SENTINEL) await writeFile(process.env.LAUNCH_SENTINEL, 'codex spawn reached\n');
  const child = (await import('node:child_process')).spawn('codex', args, { cwd: candidate, env, shell: false });
  child.stdin.end();
  let events = ''; let stderr = '';
  child.stdout.on('data', (chunk) => { events += chunk; });
  child.stderr.on('data', (chunk) => { stderr += chunk; });
  const result = await new Promise((resolveRun, rejectRun) => { child.on('error', rejectRun); child.on('close', (code, signal) => resolveRun({ code, signal })); });
  const runtime = await readRuntimeVerifier(candidate, env);
  if (!runtime.pass) throw new Error('candidate runtime isolation verification failed after launch');
  await writeFile(join(evidence, 'events.jsonl'), events);
  await writeFile(join(evidence, 'stderr.txt'), stderr);
  await writeJson(join(evidence, 'launch.json'), { slot, scenario, arm, replacementFor: slot === approvedReplacement ? 'A-control-1' : null, startedAt, endedAt: new Date().toISOString(), result, candidate, runtime });
  await cp(candidate, join(evidence, 'final-source'), { recursive: true, filter: (source) => !/[\\/](node_modules|\.git)([\\/]|$)/.test(source) });
  process.stdout.write(`${JSON.stringify({ slot, candidate: basename(candidate), ...result })}\n`);
  process.exitCode = result.code === 0 ? 0 : 1;
  }
} finally {
  await rm(candidate, { recursive: true, force: true });
}
