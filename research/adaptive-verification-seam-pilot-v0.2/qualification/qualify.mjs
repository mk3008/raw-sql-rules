import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { performance } from 'node:perf_hooks';

const root = resolve(import.meta.dirname, '..');
const disposable = mkdtempSync(join(tmpdir(), 'adaptive-v02-qualification-'));
const resultPath = join(import.meta.dirname, 'RESULT.json');

function command(cwd, args, expected) {
  const started = performance.now();
  const run = spawnSync(process.execPath, args, { cwd, encoding: 'utf8' });
  const seconds = (performance.now() - started) / 1000;
  if (run.status !== expected) {
    throw new Error(`Expected exit ${expected}, got ${run.status}: node ${args.join(' ')}\n${run.stdout}\n${run.stderr}`);
  }
  return seconds;
}

function copyTask(name) {
  const destination = join(disposable, name);
  cpSync(join(root, name), destination, { recursive: true });
  return destination;
}

function replace(path, from, to) {
  const text = readFileSync(path, 'utf8');
  if (!text.includes(from)) throw new Error(`Expected text was absent from ${path}`);
  writeFileSync(path, text.replace(from, to));
}

try {
  const cheap = copyTask('task-cheap');
  const expensive = copyTask('task-expensive');
  const cheapBroad = [0, 1, 2].map(() => command(cheap, ['test.mjs'], 1));
  const expensiveBroad = [0, 1, 2].map(() => command(expensive, ['test.mjs'], 1));

  replace(join(cheap, 'pipeline.mjs'), "checked.quantity >= 0 ? 'available' : 'sold-out'", "checked.quantity > 0 ? 'available' : 'sold-out'");
  command(cheap, ['test.mjs'], 0);

  const pipeline = join(expensive, 'pipeline.mjs');
  replace(pipeline, 'export async function runPipeline(input) {', "export function finalStatus(input) {\n  return input.completed ? 'pending' : 'pending';\n}\n\nexport async function runPipeline(input) {");
  replace(pipeline, "status: audited.completed ? 'pending' : 'pending'", 'status: finalStatus(audited)');
  const focusedFail = command(expensive, ['--input-type=module', '--eval', "import { finalStatus } from './pipeline.mjs'; if (finalStatus({ completed: true }) !== 'complete') process.exit(1)"], 1);
  replace(pipeline, "input.completed ? 'pending' : 'pending'", "input.completed ? 'complete' : 'pending'");
  const focusedPass = [0, 1, 2].map(() => command(expensive, ['--input-type=module', '--eval', "import { finalStatus } from './pipeline.mjs'; if (finalStatus({ completed: true }) !== 'complete') process.exit(1)"], 0));
  command(expensive, ['test.mjs'], 0);

  const median = (values) => [...values].sort((a, b) => a - b)[1];
  const output = {
    result: 'PASS',
    broad: { cheapSeconds: cheapBroad, expensiveSeconds: expensiveBroad, cheapMedian: median(cheapBroad), expensiveMedian: median(expensiveBroad) },
    focused: { expensiveSeconds: focusedPass, median: median(focusedPass), preRepairFails: true, preRepairSeconds: focusedFail },
    ratios: { expensiveToCheap: median(expensiveBroad) / median(cheapBroad), expensiveToFocused: median(expensiveBroad) / median(focusedPass) },
    correctness: { cheapBaselineFails: true, cheapKnownRepairPasses: true, expensiveBaselineFails: true, expensiveKnownRepairPasses: true, knownSeamAvoidsUnrelatedWaits: true },
  };
  writeFileSync(resultPath, `${JSON.stringify(output, null, 2)}\n`);
  console.log(JSON.stringify(output, null, 2));
} finally {
  if (existsSync(disposable)) rmSync(disposable, { recursive: true, force: true });
}
