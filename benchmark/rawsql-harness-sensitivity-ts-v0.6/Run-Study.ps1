[CmdletBinding()]
param([switch]$PreflightOnly,[switch]$SmokeOnly,[switch]$ExecuteOfficial,[string]$ResumeBlindReviewsFrom,[ValidateRange(60,7200)][int]$TimeoutSeconds=1800)
$ErrorActionPreference='Stop';Set-StrictMode -Version Latest
if(@($PreflightOnly,$SmokeOnly,$ExecuteOfficial,([bool]$ResumeBlindReviewsFrom)|Where-Object{$_}).Count -gt 1){throw 'Choose at most one execution mode.'}
$study=$PSScriptRoot;$repo=(Resolve-Path (Join-Path $study '..\..')).Path;$profile=Get-Content -Raw (Join-Path $repo 'benchmark/harness/host-runner/host-runner-profile.json')|ConvertFrom-Json
function Json($v,$p){$t="$p.tmp";$v|ConvertTo-Json -Depth 30|Set-Content -LiteralPath $t -Encoding utf8;Move-Item -LiteralPath $t -Destination $p -Force}
function Sha($p){(Get-FileHash -Algorithm SHA256 -LiteralPath $p).Hash.ToLowerInvariant()}
function Blob($p){(git -C $repo rev-parse "HEAD:$p").Trim()}
function Port{$l=[Net.Sockets.TcpListener]::new([Net.IPAddress]::Loopback,0);$l.Start();$p=([Net.IPEndPoint]$l.LocalEndpoint).Port;$l.Stop();$p}
function Phase-Start([string]$Name){$script:phaseName=$Name;$script:phaseDisplay=($Name -replace '/','] ');$script:phaseWatch=[Diagnostics.Stopwatch]::StartNew();Write-Host "[$script:phaseDisplay start"}
function Phase-Pass{Write-Host "[$script:phaseDisplay PASS ($([math]::Round($script:phaseWatch.Elapsed.TotalSeconds,1))s)"}
$ids=[ordered]@{'benchmark/harness/candidate-runtime/Invoke-CandidateTurn.ps1'='a0565c4762405d651605ab60c4a2558f48d03e06';'benchmark/harness/candidate-runtime/candidate-runtime-profile.json'='a332696ad96444980d8ff436816f7c83d8033157';'benchmark/harness/host-runner/Invoke-BenchmarkHost.ps1'='e7594f2ac30ceb48d51717e9f55992862c4994bc'}
$runtimeRoot=$profile.runtimeRoot;New-Item -ItemType Directory -Force -Path $runtimeRoot|Out-Null;if($ResumeBlindReviewsFrom){$run=(Resolve-Path -LiteralPath $ResumeBlindReviewsFrom).Path}else{$run=Join-Path $runtimeRoot ('rawsql-v06-'+[guid]::NewGuid().ToString('N'));New-Item -ItemType Directory -Path $run|Out-Null}
function Stop-Study($reason){if($script:phaseWatch){Write-Host "[$script:phaseDisplay FAIL ($([math]::Round($script:phaseWatch.Elapsed.TotalSeconds,1))s): $reason"};Json @{result='FAIL';classification='MEASUREMENT-INVALID';reason=$reason;atUtc=[datetime]::UtcNow.ToString('o')} (Join-Path $run 'STOP.json');throw $reason}
function Assert-RuntimeLock {
 foreach($x in $ids.GetEnumerator()){if((Blob $x.Key)-ne$x.Value){Stop-Study "AUTHORITATIVE_BLOB_MISMATCH: $($x.Key)"}}
 $n=Resolve-CodexLaunchCommand;if($n.fileName-ne$lock.nativeCodex.path -or (Sha $n.fileName)-ne$lock.nativeCodex.sha256 -or ((& $n.fileName --version|Out-String).Trim())-ne$lock.nativeCodex.version){Stop-Study 'RUNTIME_LOCK_CHANGED'}
}
function Assert-FrozenPreparation {
 $freezePath=Join-Path $study 'PREPARATION-FREEZE.json';if(-not(Test-Path $freezePath)){Stop-Study 'FROZEN_PREPARATION_MISSING'};$freeze=Get-Content -Raw $freezePath|ConvertFrom-Json
 if($freeze.finalCalibration.result -ne 'PASS' -or @($freeze.finalCalibration.cases).Count -ne 11 -or @($freeze.finalCalibration.cases|Where-Object{$_.expected-ne$_.actual}).Count){Stop-Study 'FROZEN_CALIBRATION_INVALID'}
 if($freeze.runnerQualification.result -ne 'PASS' -or $freeze.runnerQualification.cycles -ne 3){Stop-Study 'FROZEN_QUALIFICATION_INVALID'}
 if(-not $freeze.freezeSourceCommit){Stop-Study 'FREEZE_SHA_MISSING'};git -C $repo cat-file -e "$($freeze.freezeSourceCommit)^{commit}" 2>$null;if($LASTEXITCODE -ne 0){Stop-Study 'FREEZE_SHA_INVALID'}
 foreach($case in $freeze.finalCalibration.cases){$path=Join-Path $freeze.finalCalibration.evidenceRoot "$($case.id)-result.json";if(-not(Test-Path $path)-or (Sha $path)-ne$case.sha256){Stop-Study "FROZEN_CALIBRATION_EVIDENCE_MISMATCH_$($case.id)"}}
 $summary=Join-Path $freeze.finalCalibration.evidenceRoot 'CALIBRATION-SUMMARY.json';if(-not(Test-Path $summary)-or (Sha $summary)-ne$freeze.finalCalibration.summarySha256 -or (Get-Content -Raw $summary|ConvertFrom-Json).result-ne'PASS'){Stop-Study 'FROZEN_CALIBRATION_SUMMARY_MISMATCH'}
 foreach($item in $freeze.runnerQualification.cycleSha256.psobject.Properties){$path=Join-Path $freeze.runnerQualification.evidenceRoot $item.Name;if(-not(Test-Path $path)-or (Sha $path)-ne$item.Value){Stop-Study "FROZEN_QUALIFICATION_EVIDENCE_MISMATCH_$($item.Name)"}}
 foreach($source in $freeze.frozenSources){$path=Join-Path $study $source.path;if(-not(Test-Path $path)-or (Sha $path)-ne$source.sha256){Stop-Study "FROZEN_SOURCE_MISMATCH_$($source.path)"}}
}
function Freeze-Source($source,$slotRoot){$target=Join-Path $slotRoot 'final-source';New-Item -ItemType Directory $target|Out-Null;Get-ChildItem -Force $source|Where-Object{$_.Name-ne'.git'}|Copy-Item -Destination $target -Recurse -Force;$manifest=@();Get-ChildItem -Recurse -File $target|ForEach-Object{$manifest+=@{path=$_.FullName.Substring($target.Length+1);sha256=(Sha $_.FullName)}};Json $manifest (Join-Path $slotRoot 'source-manifest.json');Compress-Archive -Path (Join-Path $target '*') -DestinationPath (Join-Path $slotRoot 'final-source.zip') -Force}
function Observe($events,$slotRoot){$t=Get-Content -Raw $events;$o=[ordered]@{ddlInspected=($t-match'001_inventory|schema');dockerAttempted=($t-match'(?i)docker');dockerSucceeded=($t-match'(?i)docker.*(version|ps|compose)');postgresConnectionSucceeded=($t-match'(?i)(psql|postgres|DATABASE_URL)');applicationExecutedAgainstRealPostgres=($t-match'(?i)(DATABASE_URL|postgres://)');adHocDbVerification=($t-match'(?i)(select .*inventory|psql)');reusableRealDbHarnessCreated=($t-match'(?i)(test|harness).*postgres');driverRepresentationChecked=($t-match'(?i)(int|timestamp|Date)');productionArtifactChecked=($t-match'(?i)(npm start|dist/)');idempotencyChecked=($t-match'(?i)idempot');realConcurrentRequestsExecuted=($t-match'(?i)(concurrent|Promise.all)');dbFinalStateInspected=($t-match'(?i)(select .*reservation|inventory_events)');featureOrDbFailureObserved=($t-match'(?i)(error|fail|defect)');environmentFailureObserved=($t-match'(?i)(docker.*(not found|denied)|ECONNREFUSED)');repairAttempted=($t-match'(?i)(fix|repair|patch)');reverificationAfterRepair=($t-match'(?i)(re-test|rerun|verify)');humanIntervention=$false};Json $o (Join-Path $slotRoot 'process-observations.json')}
function Assert-PrimaryMeasurement([string]$RunRoot,[object[]]$Order){
 $state=Get-Content -Raw (Join-Path $RunRoot 'official-launch-state.json')|ConvertFrom-Json;if($state.officialLaunchCount -ne 4 -or $state.maximumOfficialLaunches -ne 4){throw 'PRIMARY_MEASUREMENT_NOT_COMPLETE'}
 foreach($slot in $Order){
  $slotRoot=Join-Path $RunRoot $slot;$source=Join-Path $slotRoot 'final-source';$manifestPath=Join-Path $slotRoot 'source-manifest.json';if(-not(Test-Path $source)-or -not(Test-Path $manifestPath)){throw "FROZEN_SOURCE_MISSING_$slot"}
  foreach($entry in (Get-Content -Raw $manifestPath|ConvertFrom-Json)){$path=Join-Path $source $entry.path;if(-not(Test-Path $path)-or (Sha $path)-ne$entry.sha256){throw "FROZEN_SOURCE_MANIFEST_MISMATCH_$slot"}}
  $primaryPath=Join-Path $slotRoot 'mechanical-primary.json';if(-not(Test-Path $primaryPath)){throw "MECHANICAL_PRIMARY_MISSING_$slot"};$primary=Get-Content -Raw $primaryPath|ConvertFrom-Json;if([string]$primary.primary -notin @('PASS','FAIL')){throw "MECHANICAL_PRIMARY_INVALID_$slot"}
 }
}
function Invoke-BlindReview([string]$RunRoot,[string]$ReviewId,[string]$Slot){
 $packet=& (Join-Path $study 'runner/New-BlindReviewPacket.ps1') -StudyRoot $study -RunRoot $RunRoot -Slot $Slot -ReviewId $ReviewId
 $checkpoint=Join-Path $packet 'review-checkpoint.json';if(Test-Path $checkpoint){$saved=Get-Content -Raw $checkpoint|ConvertFrom-Json;if($saved.result -eq 'PASS'){return @{reviewId=$ReviewId;slot=$Slot;packet=$packet;status='SKIPPED_COMPLETED'}}}
 $reviewPrompt='Review this opaque application packet for objective defects only. Return STRUCTURED JSON findings with findingId, objectiveCategory, concreteFailureCondition, expectedBehavior, predictedActualBehavior, minimalReproduction, confidence. Check PostgreSQL semantics, transactions, concurrency/idempotency, node-postgres runtime values, security, errors, and production build/start. Do not discuss SQL file style, parameter style, architecture, Rules conformance, formatting, comments, or maintainability. Do not modify files.'
 $reviewWatch=[Diagnostics.Stopwatch]::StartNew();Write-Host "[review $ReviewId] start";$reviewTurn=Invoke-CandidateTurn -WorkingDirectory $packet -Model 'gpt-5.6-sol' -ReasoningEffort 'high' -Sandbox 'read-only' -ApprovalPolicy 'never' -Prompt $reviewPrompt -JsonlPath (Join-Path $packet 'events.jsonl') -StderrPath (Join-Path $packet 'stderr.txt') -FinalResponsePath (Join-Path $packet 'findings.json');$reviewWait=Wait-CandidateTurn $reviewTurn $TimeoutSeconds;$reviewEvents=Get-Content -Raw (Join-Path $packet 'events.jsonl');if($reviewWait.timedOut -or $reviewWait.exitCode -ne 0 -or $reviewEvents -notmatch 'thread.started' -or $reviewEvents -notmatch 'turn.started'){throw "BLIND_REVIEW_FAILURE_$ReviewId"};Json @{result='PASS';reviewId=$ReviewId;slot=$Slot;completedAtUtc=[datetime]::UtcNow.ToString('o')} $checkpoint;Write-Host "[review $ReviewId] PASS ($([math]::Round($reviewWatch.Elapsed.TotalSeconds,1))s)";@{reviewId=$ReviewId;slot=$Slot;packet=$packet;status='COMPLETED'}
}
function Resume-BlindReviews {
 $lock=Get-Content -Raw (Join-Path $run 'runtime-lock.json')|ConvertFrom-Json
 $order=(git -C $repo show "$($lock.baseCommit):benchmark/rawsql-harness-sensitivity-ts-v0.6/execution-order.json"|ConvertFrom-Json).order
 if(@($order).Count-ne4){throw 'INVALID_FROZEN_OFFICIAL_ORDER'}
 Assert-PrimaryMeasurement $run $order
 $mapPath=Join-Path $run 'blind-review-map.json'
 if(Test-Path $mapPath){
  $map=Get-Content -Raw $mapPath|ConvertFrom-Json
 }else{
  $map=@()
  for($i=0;$i -lt 4;$i++){
   $map+=@{reviewId=('R{0:d2}' -f ($i+1));slot=$order[$i]}
  }
  Json $map $mapPath
 }
 if(@($map).Count-ne4){throw 'INVALID_BLIND_REVIEW_MAP'};Json @{PRIMARY_MEASUREMENT_COMPLETE='yes';BLIND_REVIEW_COMPLETE='no';reviewMap=$map;updatedAtUtc=[datetime]::UtcNow.ToString('o')} (Join-Path $run 'SECONDARY-PHASE-STATUS.json')
 foreach($entry in $map){Invoke-BlindReview $run $entry.reviewId $entry.slot|Out-Null}
 Json @{PRIMARY_MEASUREMENT_COMPLETE='yes';BLIND_REVIEW_COMPLETE='yes';reviewMap=$map;updatedAtUtc=[datetime]::UtcNow.ToString('o')} (Join-Path $run 'SECONDARY-PHASE-STATUS.json');Json @{result='COMPLETE_PENDING_UNBLIND';officialLaunchCount=4;blindReviewMap=$map} (Join-Path $run 'RUN-SUMMARY.json');Write-Host '[done] COMPLETE_PENDING_UNBLIND'
}
try {
 foreach($x in $ids.GetEnumerator()){if((Blob $x.Key)-ne$x.Value){Stop-Study "AUTHORITATIVE_BLOB_MISMATCH: $($x.Key)"}};. (Join-Path $repo 'benchmark/harness/candidate-runtime/Invoke-CandidateTurn.ps1');$native=Resolve-CodexLaunchCommand
 if($ResumeBlindReviewsFrom){Resume-BlindReviews;return}
 $lock=[ordered]@{baseCommit=(git -C $repo rev-parse HEAD).Trim();createdAtUtc=[datetime]::UtcNow.ToString('o');runtimeRoot=$runtimeRoot;nativeCodex=@{path=$native.fileName;sha256=(Sha $native.fileName);version=(& $native.fileName --version|Out-String).Trim()};powershell=$PSVersionTable.PSVersion.ToString();hostProcess=@{pid=$PID;name=(Get-Process -Id $PID).ProcessName};model=@{candidate='gpt-5.6-terra';candidateEffort='medium';reviewer='gpt-5.6-sol';reviewerEffort='high'};infrastructure=@();historicalValidationSha256=@{candidateLauncher='8e117cdb88761a219b30e09f3f21e632b44cddd513592e51c4dfb4a560b3a3f3';candidateProfile='46278fc07b16020d01623da1e4c90160eacbe8a266b2db1d4ee58dd7ff5fef22';hostRunner='cddb38ef4c572adf91faabf955869d4b2ba788c03b40476f20ee7f5d5fa73977'}};foreach($x in $ids.GetEnumerator()){$lock.infrastructure+=@{path=$x.Key;gitBlob=$x.Value;onDiskSha256=(Sha (Join-Path $repo $x.Key))}};Json $lock (Join-Path $run 'runtime-lock.json')
 Phase-Start 'preflight/runtime lock';Assert-RuntimeLock;Phase-Pass
 Phase-Start 'preflight/frozen preparation';Assert-FrozenPreparation;Phase-Pass
 if($PreflightOnly){Json @{result='PASS';officialLaunchCount=0;runtimeLock=(Join-Path $run 'runtime-lock.json');mode='preflight-only'} (Join-Path $run 'preflight.json');Write-Host "[done] PRECHECK_PASS $run";return}
 # Only current-runtime checks run here. Static CAL01-CAL11 and 3-cycle qualification are frozen evidence.
 Phase-Start 'preflight/candidate runtime';Assert-RuntimeLock;& (Join-Path $repo 'benchmark/harness/host-runner/Invoke-BenchmarkHost.ps1') -Cycles 1;if($LASTEXITCODE -ne 0){Stop-Study 'CANDIDATE_RUNTIME_QUALIFICATION_FAILURE'};Phase-Pass
 Phase-Start 'preflight/reviewer';$probe=Join-Path $run 'reviewer-probe';New-Item -ItemType Directory $probe|Out-Null;Set-Content -LiteralPath (Join-Path $probe 'README.md') -Value 'reviewer qualification dummy';git -C $probe init -q;git -C $probe config user.email reviewer@example.invalid;git -C $probe config user.name reviewer;git -C $probe add .;git -C $probe commit -q -m baseline;Assert-RuntimeLock;$probeTurn=Invoke-CandidateTurn -WorkingDirectory $probe -Model 'gpt-5.6-sol' -ReasoningEffort 'high' -Sandbox 'read-only' -ApprovalPolicy 'never' -Prompt 'Read README.md and respond exactly OK. Do not modify files.' -JsonlPath (Join-Path $run 'reviewer-probe.jsonl') -StderrPath (Join-Path $run 'reviewer-probe.stderr.txt') -FinalResponsePath (Join-Path $run 'reviewer-probe.final.txt');$probeWait=Wait-CandidateTurn $probeTurn $TimeoutSeconds;$probeEvents=Get-Content -Raw (Join-Path $run 'reviewer-probe.jsonl');if($probeWait.timedOut -or $probeWait.exitCode -ne 0 -or $probeEvents -notmatch 'thread.started' -or $probeEvents -notmatch 'turn.started'){Stop-Study 'REVIEWER_QUALIFICATION_FAILURE'};Phase-Pass
 Phase-Start 'preflight/neutral runtime smoke';& (Join-Path $study 'runner/Qualification.ps1') -Cycle 1 -PostgresPort (Port) -ApplicationPort (Port) -EvidenceRoot $run;if($LASTEXITCODE -ne 0){Stop-Study 'NEUTRAL_RUNTIME_SMOKE_FAILURE'};Phase-Pass
 if($SmokeOnly){Json @{result='PASS';officialLaunchCount=0;mode='non-study-smoke';runtimeLock=(Join-Path $run 'runtime-lock.json')} (Join-Path $run 'smoke.json');Write-Host "[done] SMOKE_PASS $run";return}
 $state=[ordered]@{schemaVersion=1;gate='OPEN';officialLaunchCount=0;maximumOfficialLaunches=4;slots=@{}};Json $state (Join-Path $run 'official-launch-state.json');$order=(Get-Content -Raw (Join-Path $study 'execution-order.json')|ConvertFrom-Json).order;if(@($order).Count-ne4){Stop-Study 'INVALID_FROZEN_OFFICIAL_ORDER'};Write-Host '[official 0/4] gate open'
 foreach($slot in $order){
  if($state.officialLaunchCount -ge 4){Stop-Study 'UNAUTHORIZED_FIFTH_CANDIDATE'}
  $task,$arm=$slot.Split('-');$slotRoot=Join-Path $run $slot;New-Item -ItemType Directory $slotRoot|Out-Null;$candidate=Join-Path $slotRoot 'candidate'
  & (Join-Path $study 'runner/Prepare-Arm.ps1') -Arm $arm -CandidatePath $candidate -IdentityOutputPath (Join-Path $slotRoot 'arm-identity.json')
  $identity=Get-Content -Raw (Join-Path $slotRoot 'arm-identity.json')|ConvertFrom-Json;if($LASTEXITCODE -ne 0 -or -not $identity.pass){Stop-Study "ARM_IDENTITY_FAILURE_$slot"}
  Assert-RuntimeLock;$candidateNumber=$state.officialLaunchCount+1;$candidateWatch=[Diagnostics.Stopwatch]::StartNew();Write-Host "[official $candidateNumber/4] candidate start"
  $turn=Invoke-CandidateTurn -WorkingDirectory $candidate -Model 'gpt-5.6-terra' -ReasoningEffort 'medium' -Sandbox 'danger-full-access' -ApprovalPolicy 'never' -Prompt (Get-Content -Raw (Join-Path $study "prompts/$task.txt")) -JsonlPath (Join-Path $slotRoot 'events.jsonl') -StderrPath (Join-Path $slotRoot 'stderr.txt') -FinalResponsePath (Join-Path $slotRoot 'final-response.txt')
  $wait=Wait-CandidateTurn $turn $TimeoutSeconds;$events=Get-Content -Raw (Join-Path $slotRoot 'events.jsonl');if($events -notmatch 'thread.started' -or $events -notmatch 'turn.started'){Stop-Study "PRELAUNCH_INFRA_FAILURE_$slot"}
  Write-Host "[official $candidateNumber/4] PASS ($([math]::Round($candidateWatch.Elapsed.TotalSeconds,1))s)"
  $state.officialLaunchCount++;$state.slots[$slot]=@{consumed=$true;process=$wait;startedAtUtc=[datetime]::UtcNow.ToString('o')};Json $state (Join-Path $run 'official-launch-state.json')
  Freeze-Source $candidate $slotRoot;Observe (Join-Path $slotRoot 'events.jsonl') $slotRoot
  $evaluatorWatch=[Diagnostics.Stopwatch]::StartNew();Write-Host '[evaluator] start'
  $evaluatorOutput=Join-Path $slotRoot 'mechanical-primary.json';& (Join-Path $study 'runner/Evaluate.ps1') -Task $task -CandidatePath $candidate -PostgresPort (Port) -ApplicationPort (Port) -OutputPath $evaluatorOutput
  $evaluatorAcceptance=& (Join-Path $study 'runner/Accept-EvaluatorResult.ps1') -OutputPath $evaluatorOutput
  if($evaluatorAcceptance -ne 'PASS'){Stop-Study "EVALUATOR_EXECUTION_FAILURE_$slot"};Write-Host "[evaluator] PASS ($([math]::Round($evaluatorWatch.Elapsed.TotalSeconds,1))s)"
 }
 # Blind reviews occur only after all candidate trees and primary results are frozen.
 $reviewMap=@();$reviewNo=0;foreach($slot in $order){
  $reviewNo++;$reviewId=('R{0:d2}' -f $reviewNo);Assert-RuntimeLock;$reviewMap+=Invoke-BlindReview $run $reviewId $slot
 }
 Json @{result='COMPLETE_PENDING_UNBLIND';officialLaunchCount=$state.officialLaunchCount;runtimeLock=(Join-Path $run 'runtime-lock.json');blindReviewMap=$reviewMap} (Join-Path $run 'RUN-SUMMARY.json');Write-Host '[done] COMPLETE_PENDING_UNBLIND'
}catch{if(-not(Test-Path (Join-Path $run 'STOP.json'))){Json @{result='FAIL';classification='MEASUREMENT-INVALID';reason=$_.Exception.Message} (Join-Path $run 'STOP.json')};throw}
