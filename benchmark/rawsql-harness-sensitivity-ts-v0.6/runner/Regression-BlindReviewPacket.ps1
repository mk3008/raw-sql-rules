[CmdletBinding()]
param(
  [Parameter(Mandatory)][string]$EvidenceRoot,
  [ValidateRange(60,7200)][int]$TimeoutSeconds=600
)

$ErrorActionPreference='Stop'
$study=Split-Path -Parent $PSScriptRoot
$repo=(Resolve-Path (Join-Path $study '..\..')).Path
New-Item -ItemType Directory -Force -Path $EvidenceRoot|Out-Null
$dummyRun=Join-Path $EvidenceRoot 'dummy-run';$source=Join-Path $dummyRun 'S01-Control\final-source';New-Item -ItemType Directory -Force -Path $source|Out-Null
Set-Content -LiteralPath (Join-Path $source 'README.md') -Value 'dummy blind review packet'
$packet=& (Join-Path $PSScriptRoot 'New-BlindReviewPacket.ps1') -StudyRoot $study -RunRoot $dummyRun -Slot 'S01-Control' -ReviewId 'R01'
$commitCount=(git -C $packet rev-list --count HEAD).Trim();$remotes=@(git -C $packet remote)
if($commitCount -ne '1' -or $remotes.Count -ne 0){throw 'Dummy packet is not a neutral one-commit/no-remote repository'}
. (Join-Path $repo 'benchmark/harness/candidate-runtime/Invoke-CandidateTurn.ps1')
$turn=Invoke-CandidateTurn -WorkingDirectory $packet -Model 'gpt-5.6-sol' -ReasoningEffort 'high' -Sandbox 'read-only' -ApprovalPolicy 'never' -Prompt 'Read BUSINESS-REQUIREMENT.txt and respond exactly OK. Do not modify files.' -JsonlPath (Join-Path $packet 'events.jsonl') -StderrPath (Join-Path $packet 'stderr.txt') -FinalResponsePath (Join-Path $packet 'final.txt')
$wait=Wait-CandidateTurn $turn $TimeoutSeconds;$events=Get-Content -Raw (Join-Path $packet 'events.jsonl')
if($wait.timedOut -or $wait.exitCode -ne 0 -or $events -notmatch 'thread.started' -or $events -notmatch 'turn.started'){throw 'Sol reviewer did not start a model turn'}
@{result='PASS';oneCommit=($commitCount -eq '1');noRemote=($remotes.Count -eq 0);threadStarted=($events -match 'thread.started');turnStarted=($events -match 'turn.started');candidateLaunched=$false;evaluatorRun=$false;dockerUsed=$false;postgresUsed=$false;calibrationRun=$false;qualificationRun=$false;packet=$packet}|ConvertTo-Json -Depth 5|Set-Content -LiteralPath (Join-Path $EvidenceRoot 'REGRESSION-SUMMARY.json') -Encoding utf8
