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
function Invoke-State([string]$Name,[string]$Path,[int]$DbPort,[int]$AppPort) {
 $project="rawsql-v05-eval-$Name-$DbPort"; $app=$null; $probe=$null; $state=[ordered]@{state=$Name;pass=$false;steps=@();error=$null;stdout=$null;stderr=$null}
 try {
  $env:POSTGRES_PORT=$DbPort; & docker compose -p $project -f (Join-Path $fixture 'compose.yaml') up -d; if($LASTEXITCODE -ne 0){throw 'postgres start'}
  foreach($n in 1..30){ $null=& docker compose -p $project -f (Join-Path $fixture 'compose.yaml') exec -T postgres pg_isready -U postgres -d inventory 2>$null; if($LASTEXITCODE -eq 0){$state.steps+='postgres-ready';break}; Start-Sleep 1 }
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
  & docker compose -p $project -f (Join-Path $fixture 'compose.yaml') down --timeout 15 --volumes --remove-orphans 2>$null
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
finally {if(Test-Path $scratch){for($attempt=1;$attempt -le 5 -and (Test-Path $scratch);$attempt++){Remove-Item -LiteralPath $scratch -Recurse -Force -ErrorAction SilentlyContinue;if(Test-Path $scratch){Start-Sleep -Milliseconds 500}}}}
$result|ConvertTo-Json -Depth 8|Set-Content -LiteralPath $OutputPath
if($result.primary -ne 'PASS'){exit 1}
