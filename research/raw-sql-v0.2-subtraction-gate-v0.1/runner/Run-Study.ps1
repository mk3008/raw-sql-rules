[CmdletBinding()]
param(
  [switch] $CalibrateOnly,
  [switch] $ExecuteOfficial,
  [int] $TimeoutSeconds = 900
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$study = Split-Path -Parent $PSScriptRoot
$repo = Resolve-Path (Join-Path $study '..\..')
$run = Join-Path $study ('evidence\run-' + [guid]::NewGuid().ToString('N'))
$launcher = Join-Path $repo 'benchmark\harness\candidate-runtime\Invoke-CandidateTurn.ps1'
$rules = Join-Path $study 'frozen\rules\raw-sql-rules.md'
$order = (Get-Content -Raw (Join-Path $study 'execution-order.json') | ConvertFrom-Json).order

function Json([object] $Value, [string] $Path) {
  $Value | ConvertTo-Json -Depth 12 | Set-Content -LiteralPath $Path -Encoding utf8
}
function Hash([string] $Path) { (Get-FileHash -Algorithm SHA256 -LiteralPath $Path).Hash.ToLowerInvariant() }
function Port { Get-Random -Minimum 20000 -Maximum 40000 }
function Require([bool] $Condition, [string] $Message) { if (-not $Condition) { throw $Message } }
function SourceManifest([string] $Path) {
  @(Get-ChildItem -LiteralPath $Path -File -Recurse | Where-Object {
    $_.FullName -notmatch '[\\/]node_modules[\\/]' -and $_.FullName -notmatch '[\\/]\.git[\\/]'
  } | ForEach-Object {
    [ordered]@{ path=$_.FullName.Substring($Path.Length).TrimStart('\\','/').Replace('\\','/'); sha256=Hash $_.FullName }
  } | Sort-Object path)
}
function Initialize-Repo([string] $Path, [string] $Task) {
  git -C $Path init -q
  git -C $Path config user.email 'subtraction-gate@example.invalid'
  git -C $Path config user.name 'subtraction-gate'
  git -C $Path add .
  git -C $Path commit -q -m baseline
  if ($Task -eq 'task-a') {
    git -C $Path branch -M integration
    git -C $Path switch -q -c candidate-work
  }
  Require (-not (git -C $Path remote)) 'candidate repository unexpectedly has a remote'
  Require ((git -C $Path rev-list --count HEAD).Trim() -eq '1') 'candidate repository is not one commit before turn'
}
function Copy-Source([string] $From, [string] $To) {
  New-Item -ItemType Directory -Force -Path $To | Out-Null
  $code = & robocopy $From $To /E /XD node_modules .git /NFL /NDL /NJH /NJS /NP
  if ($LASTEXITCODE -gt 7) { throw "robocopy final source failed: $LASTEXITCODE" }
}
function Start-Database([string] $Task, [int] $DbPort) {
  $name = "rawsql-subtraction-$Task-$DbPort"
  $schema = Join-Path $study "fixtures\$Task\database\schema.sql"
  & docker.exe run -d --rm --name $name -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=subtraction -p "127.0.0.1:$DbPort`:5432" postgres:16-alpine | Out-Null
  if ($LASTEXITCODE -ne 0) { throw "database start failed for $name" }
  $ready = $false
  foreach ($n in 1..30) { & docker.exe exec $name pg_isready -U postgres -d subtraction *> $null; if ($LASTEXITCODE -eq 0) { $ready = $true; break }; Start-Sleep 1 }
  if (-not $ready) { throw "database readiness failed for $name" }
  Get-Content -Raw $schema | & docker.exe exec -i $name psql -U postgres -d subtraction -v ON_ERROR_STOP=1 *> $null
  if ($LASTEXITCODE -ne 0) { throw "schema load failed for $name" }
  return $name
}
function Stop-Database([string] $Name) { if ($Name) { & docker.exe rm -f $Name *> $null } }
function Invoke-Evaluator([string] $Task, [string] $Workspace, [int] $DbPort, [int] $AppPort) {
  $container = $null
  try {
    $container = Start-Database $Task $DbPort
    $connection = "postgres://postgres:postgres@127.0.0.1:$DbPort/subtraction"
    $line = & node (Join-Path $PSScriptRoot 'evaluate.mjs') $Task $Workspace $AppPort $connection | Select-Object -Last 1
    if (-not $line) { throw 'evaluator produced no JSON' }
    return ($line | ConvertFrom-Json)
  } finally { Stop-Database $container }
}
function New-Workspace([string] $Slot) {
  $parts = $Slot.Split('-'); $task = "$($parts[0])-$($parts[1])"; $arm = $parts[2]
  $workspace = Join-Path $run "workspaces\$Slot"
  Copy-Item -LiteralPath (Join-Path $study "fixtures\$task") -Destination $workspace -Recurse -Force
  New-Item -ItemType Directory -Force -Path (Join-Path $workspace 'rules') | Out-Null
  Copy-Item -LiteralPath $rules -Destination (Join-Path $workspace 'rules\raw-sql-rules.md') -Force
  Copy-Item -LiteralPath (Join-Path $study "packets\$arm-AGENTS.md") -Destination (Join-Path $workspace 'AGENTS.md') -Force
  Initialize-Repo $workspace $task
  npm.cmd --prefix $workspace install --ignore-scripts --silent
  if ($LASTEXITCODE -ne 0) { throw "npm install failed before $Slot" }
  return @{ task=$task; arm=$arm; workspace=$workspace }
}
function Observe([string] $Slot, [hashtable] $Prepared, [object] $Evaluation, [object] $Turn, [object] $Wait) {
  $events = Get-Content -Raw (Join-Path $run "events\$Slot.jsonl")
  $text = $events + "`n" + (Get-Content -Raw (Join-Path $run "events\$Slot.final.txt") -ErrorAction SilentlyContinue)
  $branch = (git -C $Prepared.workspace branch --show-current).Trim()
  [ordered]@{
    slot=$Slot; task=$Prepared.task; arm=$Prepared.arm; primary=$Evaluation.primary; confirmedDefects=@($Evaluation.confirmedDefects)
    candidateWallClockSeconds=[math]::Round($Wait.elapsedSeconds, 3); candidateExitCode=$Wait.exitCode
    ddlInspected=($text -match 'schema\.sql|DDL'); realDbCheckPerformed=($text -match 'docker|postgres|DATABASE_URL|psql|pg_isready')
    reusableOrFocusedDbVerificationPathCreated=($text -match 'test|check|verify'); featureOrDbFailureObserved=($text -match 'fail|error|precision')
    failureLocalized=($text -match 'root cause|because|precision|sort'); repairPerformed=$true
    focusedReverification=($text -match 'focused|node .*test'); broadReverification=($text -match 'npm test|npm run|docker compose')
    explicitFreshReviewPerformed=($text -match '(?i)fresh review|reviewed .*Rules|reviewed .*schema')
    freshReviewBeforeMerge=($text -match '(?i)review' -and $text -match 'git merge'); reviewDiscoveredNewDefect=$false; reviewTriggeredRepair=$false
    newAbstractionOrHelperIntroduced=($text -match 'helper|adapter|abstraction'); humanIntervention=$false
    finalMergeCompletionSucceeded=if($Prepared.task -eq 'task-a'){$branch -eq 'integration'}else{$true}
  }
}
function Invoke-Calibration {
  Write-Host '[calibration] start'
  $results = @()
  foreach ($task in @('task-a','task-b')) {
    $root = Join-Path $run "calibration\$task-good"; Copy-Item -LiteralPath (Join-Path $study "fixtures\$task") -Destination $root -Recurse -Force
    if ($task -eq 'task-a') {
      @'
export const listWorkItemsSql = `
  WITH input AS (
    SELECT $1::uuid AS tenantId, $2::text AS status
  )
  SELECT work_items.id, work_items.title, work_items.status, work_items.created_at
  FROM work_items CROSS JOIN input
  WHERE work_items.tenant_id = input.tenantId
    AND (input.status IS NULL OR work_items.status = input.status)
  ORDER BY CASE WHEN $3::text = 'title' THEN work_items.title END ASC,
           CASE WHEN $3::text = 'createdAt' THEN work_items.created_at END ASC
`;
'@ | Set-Content -LiteralPath (Join-Path $root 'src\WorkItems.sql.mjs') -Encoding utf8
      @'
import http from "node:http";
import pg from "pg";
import { listWorkItemsSql } from "./WorkItems.sql.mjs";
export function createServer(connectionString) {
  const pool = new pg.Pool({ connectionString });
  return http.createServer(async (request, response) => {
    if (request.url === "/health") { response.writeHead(200, { "content-type": "application/json" }); response.end(JSON.stringify({ status: "ok" })); return; }
    if (request.method === "GET" && request.url.startsWith("/work-items")) {
      try {
        const query = new URL(request.url, "http://localhost").searchParams;
        const sort = query.get("sort") ?? "createdAt";
        if (!["createdAt", "title"].includes(sort)) { response.writeHead(400).end(); return; }
        const result = await pool.query({ text: listWorkItemsSql, values: ["11111111-1111-1111-1111-111111111111", query.get("status"), sort] });
        response.writeHead(200, { "content-type": "application/json" }); response.end(JSON.stringify(result.rows));
      } catch (error) { response.writeHead(500, { "content-type": "application/json" }); response.end(JSON.stringify({ error: error.message })); }
      return;
    }
    response.writeHead(404).end();
  });
}
'@ | Set-Content -LiteralPath (Join-Path $root 'src\server.mjs') -Encoding utf8
    } else {
      (Get-Content -Raw (Join-Path $root 'src\server.mjs')).Replace('balance: Number(result.rows[0].balance)', 'balance: String(result.rows[0].balance)') | Set-Content -LiteralPath (Join-Path $root 'src\server.mjs') -Encoding utf8
    }
    npm.cmd --prefix $root install --ignore-scripts --silent; if ($LASTEXITCODE -ne 0) { throw "calibration npm install $task" }
    $good = Invoke-Evaluator $task $root (Port) (Port)
    $bad = Invoke-Evaluator $task (Join-Path $study "fixtures\$task") (Port) (Port)
    $results += [ordered]@{ task=$task; knownGood=$good.primary; knownBad=$bad.primary; goodDefects=@($good.confirmedDefects); badDefects=@($bad.confirmedDefects) }
  }
  Json $results (Join-Path $run 'calibration.json')
  Require (@($results | Where-Object { $_.knownGood -ne 'PASS' -or $_.knownBad -ne 'FAIL' }).Count -eq 0) 'CALIBRATION_FAILURE'
  Write-Host '[calibration] PASS'
}

New-Item -ItemType Directory -Force -Path $run, (Join-Path $run 'events'), (Join-Path $run 'final-source'), (Join-Path $run 'workspaces') | Out-Null
Json ([ordered]@{ officialLaunchCount=0; maximumOfficialLaunches=4; state='PREPARATION'; order=$order }) (Join-Path $run 'official-launch-state.json')
try {
  Invoke-Calibration
  if ($CalibrateOnly) { Json @{ result='PASS'; officialLaunchCount=0 } (Join-Path $run 'RUN-SUMMARY.json'); return }
  Require $ExecuteOfficial 'Specify -ExecuteOfficial after calibration.'
  . $launcher
  $observations = @(); $count = 0
  foreach ($slot in $order) {
    Require ($count -lt 4) 'FIFTH_OFFICIAL_TURN_FORBIDDEN'
    $prepared = New-Workspace $slot
    $armManifest = SourceManifest $prepared.workspace | Where-Object { $_.path -ne 'AGENTS.md' -and $_.path -notmatch '^package-lock\.json$' }
    Json $armManifest (Join-Path $run "arm-manifest-$slot.json")
    $prompt = Get-Content -Raw (Join-Path $study "prompts\$($prepared.task).txt")
    $watch = [Diagnostics.Stopwatch]::StartNew(); Write-Host "[official $count/4] $slot start"
    $turn = Invoke-CandidateTurn -WorkingDirectory $prepared.workspace -Model 'gpt-5.6-terra' -ReasoningEffort 'medium' -Sandbox 'danger-full-access' -ApprovalPolicy 'never' -Prompt $prompt -JsonlPath (Join-Path $run "events\$slot.jsonl") -StderrPath (Join-Path $run "events\$slot.stderr.txt") -FinalResponsePath (Join-Path $run "events\$slot.final.txt")
    $wait = Wait-CandidateTurn $turn $TimeoutSeconds; $wait | Add-Member -NotePropertyName elapsedSeconds -NotePropertyValue $watch.Elapsed.TotalSeconds
    $events = Get-Content -Raw (Join-Path $run "events\$slot.jsonl")
    Require ($events -match 'thread.started' -and $events -match 'turn.started') "PRELAUNCH_INFRA_FAILURE_$slot"
    $count++; Json ([ordered]@{ officialLaunchCount=$count; maximumOfficialLaunches=4; state='RUNNING'; lastSlot=$slot }) (Join-Path $run 'official-launch-state.json')
    Copy-Source $prepared.workspace (Join-Path $run "final-source\$slot")
    $evaluation = Invoke-Evaluator $prepared.task $prepared.workspace (Port) (Port)
    Json $evaluation (Join-Path $run "mechanical-primary-$slot.json")
    $observation = Observe $slot $prepared $evaluation $turn $wait; $observations += $observation; Json $observation (Join-Path $run "observation-$slot.json")
    Write-Host "[official $count/4] $slot $($evaluation.primary) ($([math]::Round($watch.Elapsed.TotalSeconds,1))s)"
  }
  Json $observations (Join-Path $run 'observations.json')
  $classification = if (@($observations | Where-Object { $_.primary -ne 'PASS' }).Count -gt 0) { 'GUIDANCE_OUTCOME_VALUE_OBSERVED_OR_INVALID_REQUIRES_HUMAN_REVIEW' } else { 'PENDING_PROCESS_ADJUDICATION' }
  Json ([ordered]@{ result='COMPLETE'; officialLaunchCount=$count; classification=$classification; evidenceRoot=$run }) (Join-Path $run 'RUN-SUMMARY.json')
  Write-Host "[done] $classification"
} catch {
  Json ([ordered]@{ result='FAIL'; classification='INVALID_OR_INSENSITIVE'; reason=$_.Exception.Message; officialLaunchCount=((Get-Content -Raw (Join-Path $run 'official-launch-state.json') | ConvertFrom-Json).officialLaunchCount) }) (Join-Path $run 'STOP.json')
  throw
}
