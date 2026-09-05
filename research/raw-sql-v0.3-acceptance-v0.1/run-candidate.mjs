import { access, mkdir, writeFile } from 'node:fs/promises';
import { basename, resolve } from 'node:path';
import { spawn } from 'node:child_process';

const [candidateArgument, evidenceArgument] = process.argv.slice(2);
if (!candidateArgument || !evidenceArgument) {
  throw new Error('usage: node run-candidate.mjs <candidate-root> <evidence-dir>');
}

const candidate = resolve(candidateArgument);
const evidence = resolve(evidenceArgument);
const executable = process.env.CODEX_ACCEPTANCE_EXE;
if (!executable) throw new Error('CODEX_ACCEPTANCE_EXE is required');
const repairing = await access(resolve(candidate, 'REPAIR.md')).then(() => true).catch(() => false);
const prompt = repairing
  ? 'Read AGENTS.md, TASK.md, and REPAIR.md. Make only the requested minimal repair and rerun the actual PostgreSQL/selected-driver verification. Do not read outside this repository.'
  : 'Read AGENTS.md and TASK.md, then implement the requested feature. Verify it through the actual PostgreSQL and selected driver if the environment permits. Do not read outside this repository.';

await mkdir(evidence, { recursive: true });
const args = ['exec', '--ephemeral', '--json', '-m', 'gpt-5.6-terra', '-c', 'model_reasoning_effort="medium"', '--approve-for-me', '-C', candidate, prompt];
const child = spawn(executable, args, { cwd: candidate, shell: false });
let stdout = '';
let stderr = '';
child.stdout.on('data', (chunk) => { stdout += chunk; });
child.stderr.on('data', (chunk) => { stderr += chunk; });
child.stdin.end();
const result = await new Promise((resolveRun, reject) => {
  child.on('error', reject);
  child.on('close', (code, signal) => resolveRun({ code, signal }));
});
await writeFile(resolve(evidence, 'events.jsonl'), stdout);
await writeFile(resolve(evidence, 'stderr.txt'), stderr);
await writeFile(resolve(evidence, 'launch.json'), `${JSON.stringify({
  candidate: basename(candidate), executable, args: args.slice(0, -1),
  model: 'gpt-5.6-terra', reasoningEffort: 'medium', stdinClosed: true, repairing, result,
}, null, 2)}\n`);
process.exitCode = result.code === 0 ? 0 : 1;
