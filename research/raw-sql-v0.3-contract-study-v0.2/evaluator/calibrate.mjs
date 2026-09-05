import { cp, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { evaluate } from './run.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const fixture = join(root, 'fixture');
const variants = join(root, 'evaluator', 'variants');
const scenarios = ['A', 'B', 'C', 'D', 'E'];
const results = [];
for (const variant of ['known-good', 'known-bad']) {
  for (const scenario of scenarios) {
    const temp = await mkdtemp(join(tmpdir(), 'raw-sql-v03-calibration-'));
    const candidate = join(temp, 'candidate');
    await cp(fixture, candidate, { recursive: true });
    await cp(join(variants, `${variant}.js`), join(candidate, 'src', 'server.js'));
    const expected = variant === 'known-good' ? 'PASS' : 'FAIL';
    try {
      const result = await evaluate(scenario, candidate, { variant, json: false });
      results.push({ scenario, variant, expected, actual: result.primary, matchesExpected: result.primary === expected, checks: result.checks, confirmedDefects: result.confirmedDefects });
    } catch (error) {
      results.push({ scenario, variant, expected, actual: 'ERROR', matchesExpected: false, confirmedDefects: [error instanceof Error ? error.message : String(error)] });
    } finally {
      await rm(temp, { recursive: true, force: true });
    }
  }
}
const output = { result: results.every((item) => item.matchesExpected) ? 'PASS' : 'FAIL', cases: results };
await writeFile(join(root, 'evaluator', 'calibration-results.json'), `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output, null, 2));
if (output.result !== 'PASS') process.exitCode = 1;
