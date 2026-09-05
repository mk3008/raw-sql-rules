// Post-hoc only: this verifier was written after review of the frozen Primary.
import { cp, mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const command = (file, args, options) => new Promise((resolve, reject) => {
  const child = spawn(file, args, { ...options, shell: false }); let stderr = '';
  child.stderr?.on('data', (chunk) => { stderr += chunk; }); child.on('error', reject);
  child.on('close', (code) => resolve({ code, stderr }));
});
const request = async (base, path) => { try { const r = await fetch(base + path, { signal: AbortSignal.timeout(4000) }); let body; try { body = await r.json(); } catch { body = null; } return { status: r.status, body }; } catch { return { status: 599, body: null }; } };
const array = (r) => r.status === 200 && Array.isArray(r.body);
const tenant = (r, id) => array(r) && r.body.every((row) => row?.tenant_id === undefined ? String(row?.id ?? '').startsWith(id === 'tenant-a' ? '10000000-' : '20000000-') : row.tenant_id === id);
const rows = (r, n) => array(r) && r.body.length === n;
const exactKeys = (r, keys) => array(r) && r.body.every((row) => Object.keys(row ?? {}).sort().join(',') === keys);
const invalid = (r) => r.status >= 400 && r.status < 500;

export async function verify(scenario, source) {
  const work = await mkdtemp(join(tmpdir(), 'rawsql-v03-posthoc-')); const candidate = join(work, 'candidate');
  const project = `rawsqlpost_${process.pid}_${Math.random().toString(36).slice(2, 8)}`; const pgPort = 56000 + Math.floor(Math.random() * 700); const appPort = pgPort + 1000;
  let app; let appStderr = ''; const checks = {}; let error = null;
  try {
    await cp(source, candidate, { recursive: true });
    const env = { ...process.env, POSTGRES_PORT: String(pgPort) };
    if ((await command('docker', ['compose', '-p', project, '-f', 'compose.yaml', 'up', '-d'], { cwd: candidate, env })).code !== 0) throw new Error('postgres startup failed');
    for (let i = 0; i < 30; i += 1) { if ((await command('docker', ['compose', '-p', project, '-f', 'compose.yaml', 'exec', '-T', 'postgres', 'pg_isready', '-U', 'postgres', '-d', 'contract_study'], { cwd: candidate, env })).code === 0) break; if (i === 29) throw new Error('postgres readiness failed'); await sleep(500); }
    const npm = process.platform === 'win32' ? [process.env.ComSpec, ['/d','/s','/c','npm ci --ignore-scripts --no-audit --no-fund']] : ['npm',['ci','--ignore-scripts','--no-audit','--no-fund']];
    if ((await command(npm[0], npm[1], { cwd: candidate, env: process.env })).code !== 0) throw new Error('npm ci failed');
    app = spawn('node', ['src/server.js'], { cwd: candidate, env: { ...process.env, PORT: String(appPort), DATABASE_URL: `postgres://postgres:postgres@127.0.0.1:${pgPort}/contract_study` }, stdio: ['ignore','ignore','pipe'] });
    app.stderr.on('data', (chunk) => { appStderr += chunk; });
    const base = `http://127.0.0.1:${appPort}`; for (let i = 0; i < 30; i += 1) { if ((await request(base, '/health')).status === 200) break; if (i === 29) throw new Error('health failed'); await sleep(250); }
    if (scenario === 'A') { const a=await request(base,'/scenario-a/items?tenantId=tenant-a&sort=created_at&direction=desc'); const b=await request(base,'/scenario-a/items?tenantId=tenant-b&sort=price&direction=asc'); checks.finiteAndTenants=rows(a,3)&&tenant(a,'tenant-a')&&rows(b,2)&&tenant(b,'tenant-b'); checks.invalid=invalid(await request(base,'/scenario-a/items?tenantId=tenant-a&sort=name&sort=price&direction=asc')); }
    if (scenario === 'B') { const a = await request(base,'/scenario-b/items?tenantId=tenant-a'); const b = await request(base,'/scenario-b/items?tenantId=tenant-b'); const inactive = await request(base,'/scenario-b/items?tenantId=tenant-a&status=inactive'); const archived = await request(base,'/scenario-b/items?tenantId=tenant-a&status=archived'); checks.finiteAndOmission = rows(a,3)&&tenant(a,'tenant-a')&&rows(inactive,1)&&rows(archived,0); checks.tenantB = rows(b,2)&&tenant(b,'tenant-b'); checks.invalid = invalid(await request(base,'/scenario-b/items?tenantId=tenant-a&status=active&status=inactive')); }
    if (scenario === 'C') { const a=await request(base,'/scenario-c/items?tenantId=tenant-a'); const b=await request(base,'/scenario-c/items?tenantId=tenant-b&sort=created_at&status=inactive'); checks.defaultsAndTenants=rows(a,3)&&tenant(a,'tenant-a')&&rows(b,1)&&tenant(b,'tenant-b'); checks.invalid=invalid(await request(base,'/scenario-c/items?tenantId=tenant-a&sort=name&status=active&status=inactive')); }
    if (scenario === 'D') { const as=await request(base,'/scenario-d/reports?tenantId=tenant-a&report=summary'); const ad=await request(base,'/scenario-d/reports?tenantId=tenant-a&report=detailed'); const bs=await request(base,'/scenario-d/reports?tenantId=tenant-b&report=summary'); const bd=await request(base,'/scenario-d/reports?tenantId=tenant-b&report=detailed'); checks.projection = rows(as,3)&&exactKeys(as,'id,name')&&rows(ad,3)&&exactKeys(ad,'id,name,price,status')&&rows(bs,2)&&exactKeys(bs,'id,name')&&rows(bd,2)&&exactKeys(bd,'id,name,price,status'); checks.tenants = tenant(as,'tenant-a')&&tenant(ad,'tenant-a')&&tenant(bs,'tenant-b')&&tenant(bd,'tenant-b'); checks.invalid = invalid(await request(base,'/scenario-d/reports?tenantId=tenant-a&report=summary&report=detailed')); }
    if (scenario === 'E') { const a=await request(base,'/scenario-e/items?tenantId=tenant-a'); const b=await request(base,'/scenario-e/items?tenantId=tenant-b&status=inactive&limit=1'); const one=await request(base,'/scenario-e/items?tenantId=tenant-a&limit=1'); const fifty=await request(base,'/scenario-e/items?tenantId=tenant-a&limit=50'); checks.defaultsBoundsAndTenants=rows(a,3)&&tenant(a,'tenant-a')&&rows(b,1)&&tenant(b,'tenant-b')&&rows(one,1)&&rows(fifty,3); checks.invalid=invalid(await request(base,'/scenario-e/items?tenantId=tenant-a&limit=51'))&&invalid(await request(base,'/scenario-e/items?tenantId=tenant-a&limit=1.5'))&&invalid(await request(base,'/scenario-e/items?tenantId=tenant-a&limit=1&limit=2'))&&invalid(await request(base,'/scenario-e/items?tenantId=tenant-a&status=active&status=inactive')); }
  } catch (caught) { error = String(caught); } finally { app?.kill('SIGTERM'); await command('docker',['compose','-p',project,'-f','compose.yaml','down','--volumes','--remove-orphans'],{cwd:candidate,env:{...process.env,POSTGRES_PORT:String(pgPort)}}).catch(()=>{}); await rm(work,{recursive:true,force:true}); }
  return { scenario, postHoc: 'not-preregistered', result: error ? 'ERROR' : Object.values(checks).every(Boolean) ? 'PASS' : 'FAIL', checks, error, appStderr: appStderr || null };
}
