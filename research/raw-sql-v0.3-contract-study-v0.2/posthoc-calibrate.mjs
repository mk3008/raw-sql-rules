import { cp, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { evaluate } from './evaluator/run.mjs';
import { verify } from './posthoc-verifier.mjs';

const root = process.cwd();
const source = (slot) => join(root, 'evidence', 'official-runs', slot, 'final-source');
const bBad = `import http from 'node:http'; const send=(r,s,b)=>{r.writeHead(s,{'content-type':'application/json'});r.end(JSON.stringify(b))}; const a=[{id:'10000000-0000-0000-0000-000000000001',tenant_id:'tenant-a',name:'alpha'},{id:'10000000-0000-0000-0000-000000000002',tenant_id:'tenant-a',name:'beta'},{id:'10000000-0000-0000-0000-000000000003',tenant_id:'tenant-a',name:'gamma'}]; http.createServer((q,r)=>{const u=new URL(q.url,'http://x');if(u.pathname==='/health')return send(r,200,{ok:true});if(u.pathname==='/scenario-b/items'){if(u.searchParams.get('status')?.includes("'"))return send(r,400,{error:'bad'});if(u.searchParams.get('tenantId')==='tenant-b')return send(r,500,{error:'broken'});return send(r,200,u.searchParams.get('status')==='active'?[a[0],a[2]]:a)}return send(r,404,{error:'no'})}).listen(process.env.PORT||3000);`;
const dBad = `import http from 'node:http'; const send=(r,s,b)=>{r.writeHead(s,{'content-type':'application/json'});r.end(JSON.stringify(b))}; const summary=[{id:'10000000-0000-0000-0000-000000000001',name:'alpha'},{id:'10000000-0000-0000-0000-000000000002',name:'beta'},{id:'10000000-0000-0000-0000-000000000003',name:'gamma'}]; const bad=[{id:'20000000-0000-0000-0000-000000000001',name:'delta',price:1}]; http.createServer((q,r)=>{const u=new URL(q.url,'http://x');if(u.pathname==='/health')return send(r,200,{ok:true});if(u.pathname==='/scenario-d/reports'){if(u.searchParams.get('report')==='untrusted')return send(r,400,{error:'bad'});return send(r,200,u.searchParams.get('report')==='summary'?summary:bad)}return send(r,404,{error:'no'})}).listen(process.env.PORT||3000);`;
const cases=[];
for (const [scenario, normalSlot, bad] of [['B','B-control-1',bBad],['D','D-control-1',dBad]]) {
  const normal = await verify(scenario, source(normalSlot));
  const temp = await mkdtemp(join(tmpdir(), 'rawsql-v03-posthoc-cal-')); const candidate = join(temp, 'candidate');
  try { await cp(source(normalSlot), candidate, { recursive:true }); await writeFile(join(candidate,'src','server.js'), bad); const frozen = await evaluate(scenario,candidate,{json:false}); const posthoc=await verify(scenario,candidate); cases.push({scenario,normal:{postHoc:normal.result},bad:{frozenPrimary:frozen.primary,postHoc:posthoc.result,checks:posthoc.checks},matches:normal.result==='PASS'&&frozen.primary==='PASS'&&posthoc.result==='FAIL'}); } finally { await rm(temp,{recursive:true,force:true}); }
}
const output={result:cases.every((x)=>x.matches)?'PASS':'FAIL',cases}; await writeFile(join(root,'posthoc-calibration-results.json'),JSON.stringify(output,null,2)+'\n'); console.log(JSON.stringify(output,null,2)); if(output.result!=='PASS')process.exitCode=1;
