[CmdletBinding()]
param(
  [ValidateSet('simple','docker')] [string] $Mode = 'docker',
  [string] $ProfilePath = (Join-Path $PSScriptRoot 'candidate-runtime-profile.json'),
  [string] $EvidenceRoot = (Join-Path $PSScriptRoot 'evidence'),
  [int] $TimeoutSeconds = 600
)
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'Invoke-CandidateTurn.ps1')

function Write-Json([object] $Value, [string] $Path) { $Value | ConvertTo-Json -Depth 12 | Set-Content -LiteralPath $Path -Encoding utf8 }
function Get-Sha256([string] $Path) { (Get-FileHash -Algorithm SHA256 -LiteralPath $Path).Hash.ToLowerInvariant() }
function Get-FreePort {
  $listener = [Net.Sockets.TcpListener]::new([Net.IPAddress]::Loopback, 0); $listener.Start()
  $port = ([Net.IPEndPoint]$listener.LocalEndpoint).Port; $listener.Stop(); return $port
}
function Docker-Text([string[]] $DockerArguments) { $output = @(& docker @DockerArguments 2>&1 | ForEach-Object { $_.ToString() }); [pscustomobject]@{exitCode=$LASTEXITCODE; output=$output} }

$profile = Get-Content -Raw -LiteralPath $ProfilePath | ConvertFrom-Json
$id = [guid]::NewGuid().ToString('N')
$cycle = "$Mode-$id"
$cycleRoot = Join-Path $EvidenceRoot $cycle
$dummy = Join-Path ([IO.Path]::GetTempPath()) "rawsql-candidate-runtime-$id"
$events = Join-Path $cycleRoot 'events.jsonl'; $stderr = Join-Path $cycleRoot 'events.stderr.txt'; $final = Join-Path $cycleRoot 'final-response.txt'
$parentAttempts = Join-Path $cycleRoot 'parent-verification-attempts.jsonl'
$ready = Join-Path $dummy '.candidate-db-ready'; $ack = Join-Path $dummy '.parent-db-verified'
$port = Get-FreePort; $name = "rawsqlcandidate$id"; $label = "rawsql-candidate-runtime=$id"
$result = [ordered]@{
  schemaVersion=1; cycle=$cycle; mode=$Mode; result='FAIL'; classification='UNCLASSIFIED'; startedAtUtc=[DateTime]::UtcNow.ToString('o')
  id=$id; dummyRepository=$dummy; containerName=$name; label=$label; hostPort=$port
  profilePath=(Resolve-Path $ProfilePath).Path; profileSha256=(Get-Sha256 $ProfilePath); launcherSha256=(Get-Sha256 (Join-Path $PSScriptRoot 'Invoke-CandidateTurn.ps1'))
  launch=$null; repository=$null; candidateEvidence=[ordered]@{}; parentVerification=[ordered]@{containerExists=$false;expectedLabel=$false;postgresAccepting=$false;expectedTable=$false;expectedRow=$false;acknowledged=$false}; teardown=[ordered]@{containerRemoved=$false;noLabelLeaks=$false;hostPortReleased=$false}; process=$null; error=$null
}
New-Item -ItemType Directory -Path $cycleRoot -Force | Out-Null

try {
  New-Item -ItemType Directory -Path $dummy -Force | Out-Null
  & git init -q $dummy; if($LASTEXITCODE -ne 0){throw 'git init failed'}
  & git -C $dummy config user.email 'candidate-runtime@example.invalid'; & git -C $dummy config user.name 'Candidate Runtime'
  Set-Content -LiteralPath (Join-Path $dummy 'BASELINE.txt') -Value 'candidate runtime baseline' -NoNewline -Encoding utf8
  & git -C $dummy add BASELINE.txt; & git -C $dummy commit -q -m 'baseline'; if($LASTEXITCODE -ne 0){throw 'baseline commit failed'}
  $head = (& git -C $dummy rev-parse HEAD).Trim(); $status = @(& git -C $dummy status --porcelain); $remote = @(& git -C $dummy remote)
  $result.repository=[ordered]@{head=$head; clean=($status.Count -eq 0); remotes=$remote; baselineCommitCount=((& git -C $dummy rev-list --count HEAD).Trim())}
  if(-not$result.repository.clean -or $remote.Count -ne 0 -or $result.repository.baselineCommitCount -ne '1'){throw 'dummy repository invariant failed'}

  if($Mode -eq 'simple') {
    $prompt = 'Inspect this dummy repository and report that it is accessible. Do not modify files.'
  } else {
    $prompt = @"
This is a candidate runtime Docker/PostgreSQL validation, not a product task. Work only in this dummy repository. You must personally use shell tools to do all of the following: run docker version and prove Docker daemon access; start exactly one isolated PostgreSQL 16 container named $name with label $label and host port $port mapped to 5432; wait until it accepts connections; connect with psql; create table candidate_probe(id int primary key, note text); insert exactly (1,'candidate-created'); query and verify that row; create the empty file .candidate-db-ready; then wait (poll once per second for up to 180 seconds) until .parent-db-verified exists. Only after that acknowledgement, stop and remove your own named container and complete normally. Do not use, inspect, stop, or remove any Docker resource other than the named/labelled container. Do not alter Git history.
"@
  }
  $turn = Invoke-CandidateTurn -WorkingDirectory $dummy -Model $profile.model -ReasoningEffort $profile.reasoningEffort -Sandbox $profile.sandbox -ApprovalPolicy $profile.approvalPolicy -Prompt $prompt -JsonlPath $events -StderrPath $stderr -FinalResponsePath $final
  $result.launch=$turn.invocation
  if($Mode -eq 'docker') {
    $deadline=[DateTime]::UtcNow.AddSeconds($TimeoutSeconds)
    while(-not $turn.process.HasExited -and [DateTime]::UtcNow -lt $deadline) {
      $readyPresent = Test-Path -LiteralPath $ready
      $ackPresent = Test-Path -LiteralPath $ack
      if($readyPresent -and -not $ackPresent) {
        $attempt=[ordered]@{atUtc=[DateTime]::UtcNow.ToString('o');readyPresent=$readyPresent;ackPresent=$ackPresent}
        try {
          $inspect=Docker-Text @('inspect',$name); $result.parentVerification.containerExists=($inspect.exitCode -eq 0); $attempt.containerExists=$result.parentVerification.containerExists
          $labelCheck=Docker-Text @('inspect','--format','{{ index .Config.Labels "rawsql-candidate-runtime" }}',$name)
          $result.parentVerification.expectedLabel=($labelCheck.exitCode -eq 0 -and $labelCheck.output[-1].Trim() -eq $id); $attempt.expectedLabel=$result.parentVerification.expectedLabel
          $readyCheck=Docker-Text @('exec',$name,'pg_isready','-U','postgres','-d','postgres'); $result.parentVerification.postgresAccepting=($readyCheck.exitCode -eq 0); $attempt.postgresAccepting=$result.parentVerification.postgresAccepting
          $tableCheck=Docker-Text @('exec',$name,'psql','-U','postgres','-d','postgres','-At','-c',"select to_regclass('public.candidate_probe')")
          $result.parentVerification.expectedTable=($tableCheck.exitCode -eq 0 -and $tableCheck.output[-1].Trim() -eq 'candidate_probe'); $attempt.expectedTable=$result.parentVerification.expectedTable
          $rowCheck=Docker-Text @('exec',$name,'psql','-U','postgres','-d','postgres','-At','-c',"select note from candidate_probe where id=1")
          $result.parentVerification.expectedRow=($rowCheck.exitCode -eq 0 -and $rowCheck.output[-1].Trim() -eq 'candidate-created'); $attempt.expectedRow=$result.parentVerification.expectedRow
          if(@($result.parentVerification.containerExists,$result.parentVerification.expectedLabel,$result.parentVerification.postgresAccepting,$result.parentVerification.expectedTable,$result.parentVerification.expectedRow) -notcontains $false) {
            New-Item -ItemType File -Path $ack -Force | Out-Null; $result.parentVerification.acknowledged=$true; $attempt.acknowledged=$true
          }
        } catch { $attempt.error=$_.Exception.Message }
        ($attempt | ConvertTo-Json -Compress) | Add-Content -LiteralPath $parentAttempts -Encoding utf8
      }
      Start-Sleep -Milliseconds 500
    }
    $remaining=[Math]::Max(1,[int][Math]::Ceiling(($deadline-[DateTime]::UtcNow).TotalSeconds))
    $wait=Wait-CandidateTurn -CandidateTurn $turn -TimeoutSeconds $remaining
  } else { $wait=Wait-CandidateTurn -CandidateTurn $turn -TimeoutSeconds $TimeoutSeconds }
  $result.process=$wait
  if($wait.timedOut){$result.classification='TIMEOUT';throw 'candidate turn timed out'}
  if($wait.exitCode -ne 0){$result.classification='MODEL_START_FAILURE';throw "candidate process exit code $($wait.exitCode)"}
  $eventText=if(Test-Path $events){Get-Content -Raw $events}else{''}
  $eventObjects=if(Test-Path $events){@(Get-Content -LiteralPath $events | ForEach-Object { $_ | ConvertFrom-Json })}else{@()}
  $eventDecoded=$eventObjects | ConvertTo-Json -Depth 12
  $result.candidateEvidence.threadStarted=$eventText -match 'thread.started'; $result.candidateEvidence.turnStarted=$eventText -match 'turn.started'
  $result.candidateEvidence.workingDirectoryObserved=(($eventDecoded -replace '\\\\',[string][char]92) -match [regex]::Escape($dummy))
  $result.candidateEvidence.finalResponseCaptured=(Test-Path -LiteralPath $final) -and ((Get-Item $final).Length -gt 0)
  $result.candidateEvidence.validExit=$true
  if($Mode -eq 'docker') {
    $result.candidateEvidence.modelDockerActivity=($eventText -match 'docker version')
    $result.candidateEvidence.modelPostgresActivity=($eventText -match 'postgres')
    $gone=Docker-Text @('ps','-a','--filter',"name=^/$name$",'--format','{{.ID}}'); $result.teardown.containerRemoved=[string]::IsNullOrWhiteSpace(($gone.output -join "`n").Trim())
    $leaks=Docker-Text @('ps','-a','--filter',"label=$label",'--format','{{.ID}}'); $result.teardown.noLabelLeaks=[string]::IsNullOrWhiteSpace(($leaks.output -join "`n").Trim())
    $result.teardown.hostPortReleased=(-not(Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue))
    if(-not $result.parentVerification.acknowledged){if($eventText -match 'Access is denied|Permission denied'){$result.classification='SANDBOX_PERMISSION_FAILURE'}else{$result.classification='HANDSHAKE_FAILURE'};throw 'parent never independently verified and acknowledged database state'}
    if(@($result.candidateEvidence.modelDockerActivity,$result.candidateEvidence.modelPostgresActivity,$result.teardown.containerRemoved,$result.teardown.noLabelLeaks,$result.teardown.hostPortReleased) -contains $false){$result.classification='TEARDOWN_FAILURE';throw 'candidate docker evidence or teardown incomplete'}
  }
  if(@($result.candidateEvidence.threadStarted,$result.candidateEvidence.turnStarted,$result.candidateEvidence.finalResponseCaptured,$result.candidateEvidence.validExit) -contains $false){$result.classification='MODEL_START_FAILURE';throw 'required launch evidence incomplete'}
  $result.result='PASS'; $result.classification='PASS'
} catch {
  if($result.classification -eq 'UNCLASSIFIED'){$result.classification='LAUNCHER_FAILURE'}
  $result.error=$_.Exception.Message
} finally {
  if($Mode -eq 'docker') {
    $residual=Docker-Text @('ps','-a','--filter',"label=$label",'--format','{{.ID}}')
    if(-not [string]::IsNullOrWhiteSpace(($residual.output -join "`n").Trim())) { $result.teardown.residualAfterFailure=$residual.output }
  }
  $result.finishedAtUtc=[DateTime]::UtcNow.ToString('o'); Write-Json $result (Join-Path $cycleRoot 'result.json')
}
if($result.result -ne 'PASS'){exit 1}
