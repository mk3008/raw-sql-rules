import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { command, safeEnvironment, writeJson } from './isolation.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)));
const evidence = join(root, 'evidence', 'preflight', 'runner-transport-probe-r2');
const timeoutMs = 120_000;

const exists = async (path) => {
  try { await (await import('node:fs/promises')).access(path); return true; } catch { return false; }
};

if (await exists(evidence)) throw new Error('runner transport preflight evidence already exists');
await mkdir(evidence, { recursive: true });
const candidate = await mkdtemp(join(tmpdir(), 'rawsql-v03r2-runner-transport-'));
const env = safeEnvironment(candidate);
const setting = 'model_reasoning_effort="medium"';
const prompt = 'Reply with exactly RUNNER_TRANSPORT_OK.';

try {
  const git = await command('git', ['init', '--quiet'], { cwd: candidate, env });
  if (git.code !== 0) throw new Error(`git init failed: ${git.stderr}`);
  const version = await command('codex', ['--version'], { cwd: candidate, env });
  const args = ['exec', '--ephemeral', '--json', '-m', 'gpt-5.6-terra', '-c', setting, '--approve-for-me', '-C', candidate, prompt];
  const child = (await import('node:child_process')).spawn('codex', args, { cwd: candidate, env, shell: false });
  let stdout = ''; let stderr = ''; let timedOut = false;
  child.stdout.on('data', (chunk) => { stdout += chunk; });
  child.stderr.on('data', (chunk) => { stderr += chunk; });
  child.stdin.end();
  const result = await new Promise((resolveRun, rejectRun) => {
    const timer = setTimeout(() => { timedOut = true; child.kill(); }, timeoutMs);
    child.on('error', (error) => { clearTimeout(timer); rejectRun(error); });
    child.on('close', (code, signal) => { clearTimeout(timer); resolveRun({ code, signal }); });
  });
  await writeFile(join(evidence, 'stdout.jsonl'), stdout);
  await writeFile(join(evidence, 'stderr.txt'), stderr);
  const events = stdout.split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));
  const message = events.find((event) => event.type === 'item.completed' && event.item?.type === 'agent_message')?.item?.text;
  const turnCompleted = events.some((event) => event.type === 'turn.completed');
  const pass = !timedOut && result.code === 0 && message === 'RUNNER_TRANSPORT_OK' && turnCompleted;
  await writeJson(join(evidence, 'result.json'), {
    pass,
    timedOut,
    result,
    executableResolution: { command: 'codex', version: version.stdout, versionExitCode: version.code },
    profile: { model: 'gpt-5.6-terra', reasoningEffort: 'medium', approval: '--approve-for-me', ephemeral: true },
    candidate: basename(candidate),
    modelMessage: message ?? null,
    turnCompleted,
    environment: {
      candidateRootInjected: env.CANDIDATE_ROOT === candidate,
      codexHomeExplicitlySet: Object.keys(env).some((key) => key.toLowerCase() === 'codex_home'),
      proxyVariablesExplicitlySet: Object.keys(env).some((key) => /^(http|https|all)_proxy$|^no_proxy$/i.test(key)),
      caVariablesExplicitlySet: Object.keys(env).some((key) => /^(ssl_cert_file|ssl_cert_dir|node_extra_ca_certs)$/i.test(key)),
    },
  });
  process.stdout.write(`${JSON.stringify({ pass, candidate: basename(candidate), timedOut, result })}\n`);
  process.exitCode = pass ? 0 : 1;
} finally {
  await rm(candidate, { recursive: true, force: true });
}
