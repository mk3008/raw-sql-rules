param(
 [Parameter(Mandatory)][ValidateSet('S01','S02')][string]$Task,
 [Parameter(Mandatory)][string]$CandidatePath,
 [Parameter(Mandatory)][int]$PostgresPort,
 [Parameter(Mandatory)][int]$ApplicationPort,
 [Parameter(Mandatory)][string]$OutputPath
)
$ErrorActionPreference='Stop'
$root=Split-Path -Parent (Split-Path -Parent $PSCommandPath)
$fixture=Join-Path $root 'fixture'
$scratch=Join-Path ([System.IO.Path]::GetTempPath()) ("rawsql-v05-eval-"+[guid]::NewGuid().ToString('N'))
$checks=[ordered]@{normalProductionStart='FAIL';cleanReconstruction='FAIL'}
$evidence=[ordered]@{}
function Stop-Descendants([int]$ParentProcessId) {
 foreach($child in @(Get-CimInstance Win32_Process -Filter "ParentProcessId=$ParentProcessId" -ErrorAction SilentlyContinue)) { Stop-Descendants ([int]$child.ProcessId); Stop-Process -Id $child.ProcessId -Force -ErrorAction SilentlyContinue }
}
function Invoke-ComposeCommand([string]$Project,[string[]]$ComposeArguments,[int]$TimeoutSeconds=30) {
 $arguments=@('compose','-p',$Project,'-f',(Join-Path $fixture 'compose.yaml'))+$ComposeArguments
 $stdout=Join-Path $scratch ("docker-"+[guid]::NewGuid().ToString('N')+".out.log")
 $stderr=Join-Path $scratch ("docker-"+[guid]::NewGuid().ToString('N')+".err.log")
 $process=Start-Process -FilePath docker.exe -ArgumentList $arguments -RedirectStandardOutput $stdout -RedirectStandardError $stderr -PassThru
 if(-not $process.WaitForExit($TimeoutSeconds*1000)){
  Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
  throw "docker compose command timed out for $Project"
 }
 return $process.ExitCode
}
function Stop-ComposeProject([string]$Project) {
 if((Invoke-ComposeCommand -Project $Project -ComposeArguments @('down','--timeout','15','--volumes','--remove-orphans')) -ne 0){throw "docker compose teardown failed: $Project"}
}
function Remove-ScratchBounded([string]$Path) {
 if(-not (Test-Path $Path)){return 'removed'}
 $stdout=Join-Path ([System.IO.Path]::GetTempPath()) ("rawsql-v05-cleanup-"+[guid]::NewGuid().ToString('N')+".out.log")
 $stderr=Join-Path ([System.IO.Path]::GetTempPath()) ("rawsql-v05-cleanup-"+[guid]::NewGuid().ToString('N')+".err.log")
 try {
  $cleanup=Start-Process -FilePath cmd.exe -ArgumentList @('/d','/c',"rmdir /s /q `"$Path`"") -RedirectStandardOutput $stdout -RedirectStandardError $stderr -PassThru
  if(-not $cleanup.WaitForExit(30000)){Stop-Process -Id $cleanup.Id -Force -ErrorAction SilentlyContinue;return 'deferred-timeout'}
  if(Test-Path $Path){return "deferred-exit-$($cleanup.ExitCode)"}
  return 'removed'
 } finally {
  Remove-Item -LiteralPath $stdout,$stderr -Force -ErrorAction SilentlyContinue
 }
}
function Invoke-State([string]$Name,[string]$Path,[int]$DbPort,[int]$AppPort) {
 $project="rawsql-v05-eval-$Name-$DbPort"; $app=$null; $probe=$null; $state=[ordered]@{state=$Name;pass=$false;steps=@();error=$null;stdout=$null;stderr=$null}
 try {
  $env:POSTGRES_PORT=$DbPort; if((Invoke-ComposeCommand -Project $project -ComposeArguments @('up','-d')) -ne 0){throw 'postgres start'}
  foreach($n in 1..30){ if((Invoke-ComposeCommand -Project $project -ComposeArguments @('exec','-T','postgres','pg_isready','-U','postgres','-d','inventory') -TimeoutSeconds 10) -eq 0){$state.steps+='postgres-ready';break}; Start-Sleep 1 }
  if($state.steps -notcontains 'postgres-ready'){throw 'postgres readiness'}
  npm ci --ignore-scripts --silent --prefix $Path; if($LASTEXITCODE -ne 0){throw 'npm ci'}; $state.steps+='npm-ci'
  $env:DATABASE_URL="postgres://postgres:postgres@127.0.0.1:$DbPort/inventory"; $env:PORT=$AppPort
  $out=Join-Path $scratch "$Name-app.out.log"; $err=Join-Path $scratch "$Name-app.err.log"
  $app=Start-Process npm.cmd -ArgumentList @('start','--silent') -WorkingDirectory $Path -RedirectStandardOutput $out -RedirectStandardError $err -PassThru
  $healthy=$false; foreach($n in 1..30){try{if((Invoke-WebRequest "http://127.0.0.1:$AppPort/health" -SkipHttpErrorCheck).StatusCode -eq 200){$healthy=$true;break}}catch{};Start-Sleep 1}
  if(-not$healthy){throw 'declared npm start health failed'}; $state.steps+='declared-start-health'
  $probe=Join-Path $Path '.rawsql-v05-evaluate.mjs';Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'evaluate.mjs') -Destination $probe -Force;$json=& node $probe $Task $AppPort | Select-Object -Last 1; $result=$json|ConvertFrom-Json
  if($result.primary -ne 'PASS'){throw ($result.confirmedDefects -join '; ')}; $state.steps+='mechanical-checks'; $state.pass=$true
 } catch {$state.error=$_.Exception.Message} finally {
  if($app){Stop-Descendants ([int]$app.Id);if(-not $app.HasExited){Stop-Process -Id $app.Id -Force};Start-Sleep -Milliseconds 500};if($probe-and(Test-Path $probe)){Remove-Item -LiteralPath $probe -Force -ErrorAction SilentlyContinue}
  if(Test-Path $scratch){$state.stdout=if(Test-Path $out){Get-Content -Raw $out}else{''};$state.stderr=if(Test-Path $err){Get-Content -Raw $err}else{''}}
  try{Stop-ComposeProject $project}catch{if(-not $state.error){$state.error=$_.Exception.Message}}
 }; return $state
}
try {
 New-Item -ItemType Directory -Path $scratch|Out-Null
 $normal=Invoke-State 'normal' $CandidatePath $PostgresPort $ApplicationPort; $evidence.normalProductionStart=$normal; if($normal.pass){$checks.normalProductionStart='PASS'}
 $rebuild=Join-Path $scratch 'reconstruction'; Copy-Item -LiteralPath $CandidatePath -Destination $rebuild -Recurse -Force; $mods=Join-Path $rebuild 'node_modules';if(Test-Path $mods){Remove-Item $mods -Recurse -Force}; npm ci --ignore-scripts --silent --prefix $rebuild; if($LASTEXITCODE -ne 0){throw 'clean reconstruction npm ci'};npm run build --silent --prefix $rebuild; if($LASTEXITCODE -ne 0){throw 'clean reconstruction build'}
 $clean=Invoke-State 'clean-build' $rebuild ($PostgresPort+20) ($ApplicationPort+20); $evidence.cleanReconstruction=$clean; if($clean.pass){$checks.cleanReconstruction='PASS'}
 $defects=@();if($checks.normalProductionStart -ne 'PASS'){$defects+='normal declared production start failed'};if($checks.cleanReconstruction -ne 'PASS'){$defects+='clean reconstruction failed'}
 $result=[ordered]@{task=$Task;primary=if($defects.Count){'FAIL'}else{'PASS'};confirmedDefects=$defects;states=$evidence}
} catch {$result=[ordered]@{task=$Task;primary='FAIL';confirmedDefects=@($_.Exception.Message);states=$evidence}}
finally {if($result){$result.scratchCleanup=Remove-ScratchBounded $scratch;$result.scratchPath=if(Test-Path $scratch){$scratch}else{$null}}}
$result|ConvertTo-Json -Depth 8|Set-Content -LiteralPath $OutputPath
if($result.primary -ne 'PASS'){exit 1}
