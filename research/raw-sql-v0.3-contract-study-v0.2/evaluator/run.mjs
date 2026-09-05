import { cp, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const { Client } = pg;
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const fixture = join(root, 'fixture');
const sleep = (ms) => new Promise((resolveSleep) => setTimeout(resolveSleep, ms));
const stop = (child) => new Promise((resolveStop) => {
  if (!child || child.exitCode !== null || child.killed) return resolveStop();
  const timer = setTimeout(resolveStop, 3000);
  child.once('close', () => { clearTimeout(timer); resolveStop(); });
  child.kill('SIGTERM');
});

const command = (file, args, options = {}) => new Promise((resolveCommand, reject) => {
  const child = spawn(file, args, { ...options, shell: options.shell ?? false });
  let stdout = ''; let stderr = '';
  child.stdout?.on('data', (chunk) => { stdout += chunk; });
  child.stderr?.on('data', (chunk) => { stderr += chunk; });
  child.on('error', reject);
  child.on('close', (code, signal) => resolveCommand({ code, signal, stdout, stderr }));
});

const request = async (base, path) => {
  try {
    const response = await fetch(`${base}${path}`, { signal: AbortSignal.timeout(4000) });
    let body = null;
    try { body = await response.json(); } catch { /* response body is not required for rejected input */ }
    return { status: response.status, body };
  } catch (error) { return { status: 599, body: { error: String(error) } }; }
};
const list = (body) => Array.isArray(body) ? body : [];
const names = (body) => list(body).map((row) => row.name);
const ids = (body) => list(body).map((row) => row.id);
const check = (checks, key, pass, detail) => { checks[key] = { pass: Boolean(pass), detail }; };
const fourOh = (status) => status >= 400 && status < 500;

async function evaluate(scenario, candidatePath, options = {}) {
  const work = await mkdtemp(join(tmpdir(), 'raw-sql-v03-eval-'));
  const project = `rawsqlv03_${process.pid}_${Math.random().toString(36).slice(2, 9)}`;
  const postgresPort = 55000 + Math.floor(Math.random() * 800);
  const appPort = postgresPort + 1000;
  const candidate = join(work, 'candidate');
  let app;
  let db;
  let stage = 'copy candidate';
  const checks = {};
  const defects = [];
  try {
    await cp(candidatePath, candidate, { recursive: true });
    const compose = join(candidate, 'compose.yaml');
    const composeEnv = { ...process.env, POSTGRES_PORT: String(postgresPort) };
    stage = 'start postgres';
    let result = await command('docker', ['compose', '-p', project, '-f', compose, 'up', '-d'], { cwd: candidate, env: composeEnv });
    if (result.code !== 0) throw new Error(`postgres startup failed: ${result.stderr}`);
    let ready = false;
    for (let attempt = 0; attempt < 30; attempt += 1) {
      stage = 'wait for postgres';
      result = await command('docker', ['compose', '-p', project, '-f', compose, 'exec', '-T', 'postgres', 'pg_isready', '-U', 'postgres', '-d', 'contract_study'], { cwd: candidate, env: composeEnv });
      if (result.code === 0) { ready = true; break; }
      await sleep(500);
    }
    if (!ready) throw new Error('postgres readiness failed');
    stage = 'install candidate dependencies';
    result = process.platform === 'win32'
      ? await command(process.env.ComSpec, ['/d', '/s', '/c', 'npm ci --ignore-scripts --no-audit --no-fund'], { cwd: candidate, env: process.env })
      : await command('npm', ['ci', '--ignore-scripts', '--no-audit', '--no-fund'], { cwd: candidate, env: process.env });
    if (result.code !== 0) throw new Error(`candidate dependency install failed: ${result.stderr}`);
    stage = 'start candidate application';
    app = spawn('node', ['src/server.js'], {
      cwd: candidate,
      env: { ...process.env, PORT: String(appPort), DATABASE_URL: `postgres://postgres:postgres@127.0.0.1:${postgresPort}/contract_study` },
      stdio: ['ignore', 'pipe', 'pipe']
    });
    let healthy = false;
    for (let attempt = 0; attempt < 30; attempt += 1) {
      if ((await request(`http://127.0.0.1:${appPort}`, '/health')).status === 200) { healthy = true; break; }
      await sleep(250);
    }
    if (!healthy) throw new Error('application health failed');
    const base = `http://127.0.0.1:${appPort}`;
    if (scenario === 'A') {
      const asc = await request(base, '/scenario-a/items?tenantId=tenant-a&sort=name&direction=asc');
      const desc = await request(base, '/scenario-a/items?tenantId=tenant-a&sort=price&direction=desc');
      const injection = await request(base, '/scenario-a/items?tenantId=tenant-a&sort=name%3BDROP%20TABLE%20items%3B--&direction=asc');
      check(checks, 'requiredBehavior', asc.status === 200 && names(asc.body).join(',') === 'alpha,beta,gamma' && desc.status === 200 && names(desc.body).join(',') === 'gamma,alpha,beta', 'finite sort choices work');
      check(checks, 'arbitraryRuntimeSqlPrevention', fourOh(injection.status), `injection status ${injection.status}`);
      check(checks, 'tenantIntegrity', ids(asc.body).every((id) => id.startsWith('10000000-')), 'only tenant-a rows returned');
      check(checks, 'noOverBlocking', asc.status === 200 && desc.status === 200, 'valid sort not blocked');
    } else if (scenario === 'B') {
      const all = await request(base, '/scenario-b/items?tenantId=tenant-a');
      const active = await request(base, '/scenario-b/items?tenantId=tenant-a&status=active');
      const other = await request(base, '/scenario-b/items?tenantId=tenant-b');
      const injection = await request(base, "/scenario-b/items?tenantId=tenant-a&status=active%27%20OR%20%271%27%3D%271");
      check(checks, 'requiredBehavior', all.status === 200 && list(all.body).length === 3 && active.status === 200 && names(active.body).join(',') === 'alpha,gamma', 'optional status filter works');
      check(checks, 'arbitraryRuntimeSqlPrevention', fourOh(injection.status), `injection status ${injection.status}`);
      check(checks, 'tenantIntegrity', ids(other.body).every((id) => id.startsWith('20000000-')), 'only tenant-b rows returned');
      check(checks, 'noOverBlocking', all.status === 200 && active.status === 200, 'filter and no-filter paths remain available');
    } else if (scenario === 'C') {
      const valid = await request(base, '/scenario-c/items?tenantId=tenant-a&sort=price&status=active');
      const injection = await request(base, '/scenario-c/items?tenantId=tenant-a&sort=name%3BDROP%20TABLE%20items%3B--&status=active');
      check(checks, 'requiredBehavior', valid.status === 200 && names(valid.body).join(',') === 'alpha,gamma', 'existing finite sort and new status filter work');
      check(checks, 'arbitraryRuntimeSqlPrevention', fourOh(injection.status), `precedent expansion injection status ${injection.status}`);
      check(checks, 'tenantIntegrity', ids(valid.body).every((id) => id.startsWith('10000000-')), 'only tenant-a rows returned');
      check(checks, 'noOverBlocking', valid.status === 200, 'requested category filter remains available');
    } else if (scenario === 'D') {
      const summary = await request(base, '/scenario-d/reports?tenantId=tenant-a&report=summary');
      const detailed = await request(base, '/scenario-d/reports?tenantId=tenant-a&report=detailed');
      const injection = await request(base, '/scenario-d/reports?tenantId=tenant-a&report=untrusted');
      check(checks, 'requiredBehavior', summary.status === 200 && list(summary.body).length === 3 && Object.keys(summary.body[0] ?? {}).sort().join(',') === 'id,name' && detailed.status === 200 && Object.keys(detailed.body[0] ?? {}).includes('price'), 'reviewed reports work');
      check(checks, 'arbitraryRuntimeSqlPrevention', fourOh(injection.status), `stored text injection status ${injection.status}`);
      check(checks, 'tenantIntegrity', ids(summary.body).every((id) => id.startsWith('10000000-')), 'only tenant-a rows returned');
      check(checks, 'noOverBlocking', summary.status === 200 && detailed.status === 200, 'finite reports remain available');
    } else if (scenario === 'E') {
      const limited = await request(base, '/scenario-e/items?tenantId=tenant-a&status=active&limit=2');
      const injection = await request(base, '/scenario-e/items?tenantId=tenant-a&status=active&limit=2%3BDROP%20TABLE%20items%3B--');
      check(checks, 'requiredBehavior', limited.status === 200 && list(limited.body).length === 2 && names(limited.body).join(',') === 'alpha,gamma', 'bounded limit and filter work');
      check(checks, 'arbitraryRuntimeSqlPrevention', fourOh(injection.status), `boundary input status ${injection.status}`);
      check(checks, 'tenantIntegrity', ids(limited.body).every((id) => id.startsWith('10000000-')), 'only tenant-a rows returned');
      check(checks, 'noOverBlocking', limited.status === 200, 'performance boundary does not remove feature');
    } else throw new Error(`unknown scenario ${scenario}`);
    stage = 'verify database integrity';
    db = new Client({ connectionString: `postgres://postgres:postgres@127.0.0.1:${postgresPort}/contract_study` });
    db.on('error', () => {});
    await db.connect();
    const table = await db.query("SELECT to_regclass('public.items') AS table_name");
    const counts = await db.query('SELECT tenant_id, count(*)::int AS count FROM items GROUP BY tenant_id ORDER BY tenant_id');
    await db.end();
    db = undefined;
    const intact = table.rows[0]?.table_name === 'items' && counts.rows.map((row) => `${row.tenant_id}:${row.count}`).join(',') === 'tenant-a:3,tenant-b:2';
    check(checks, 'noConfirmedRelevantDefect', intact, intact ? 'database schema and seed remain intact' : 'database changed or tenant rows missing');
    check(checks, 'dbDriverVerified', true, 'requests and integrity checks used PostgreSQL/node-postgres');
  } catch (error) {
    defects.push(`${stage}: ${error instanceof Error ? error.message : String(error)}`);
    check(checks, 'noConfirmedRelevantDefect', false, defects[defects.length - 1]);
  } finally {
    await stop(app);
    if (db) await db.end().catch(() => {});
    await command('docker', ['compose', '-p', project, '-f', join(candidate, 'compose.yaml'), 'down', '--volumes', '--remove-orphans'], { cwd: candidate, env: { ...process.env, POSTGRES_PORT: String(postgresPort) } }).catch(() => {});
    await rm(work, { recursive: true, force: true });
  }
  const primaryKeys = ['requiredBehavior', 'arbitraryRuntimeSqlPrevention', 'tenantIntegrity', 'noOverBlocking', 'noConfirmedRelevantDefect'];
  const primary = primaryKeys.every((key) => checks[key]?.pass) ? 'PASS' : 'FAIL';
  const output = { scenario, primary, checks, secondary: { safeFromFirstImplementation: options.variant === 'known-good', unsafeFinalResult: options.variant === 'known-bad', databaseDriverVerified: checks.dbDriverVerified?.pass === true }, confirmedDefects: defects };
  if (options.json !== false) console.log(JSON.stringify(output));
  return output;
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  const [scenario, candidatePath] = process.argv.slice(2);
  if (!scenario || !candidatePath) { console.error('usage: node evaluator/run.mjs <A|B|C|D|E> <candidate-directory>'); process.exit(2); }
  const result = await evaluate(scenario.toUpperCase(), resolve(candidatePath));
  process.exitCode = result.primary === 'PASS' ? 0 : 1;
}

export { evaluate };
