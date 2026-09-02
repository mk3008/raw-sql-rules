[CmdletBinding()]
param(
  [string] $ProfilePath = (Join-Path $PSScriptRoot 'host-runner-profile.json'),
  [ValidateRange(1, 99)] [int] $Cycles = 1,
  [int] $TimeoutSeconds = 600
)
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
function Json($v,$p){$v|ConvertTo-Json -Depth 12|Set-Content -LiteralPath $p -Encoding utf8}
function Sha($p){(Get-FileHash -LiteralPath $p -Algorithm SHA256).Hash.ToLowerInvariant()}
function Invoke-DockerCommand([string[]]$a){$o=@(& docker.exe @a 2>&1 | ForEach-Object {$_.ToString()});[pscustomobject]@{code=$LASTEXITCODE;out=$o}}
function Port {$l=[Net.Sockets.TcpListener]::new([Net.IPAddress]::Loopback,0);$l.Start();$p=([Net.IPEndPoint]$l.LocalEndpoint).Port;$l.Stop();$p}
$hostProfile=Get-Content -Raw $ProfilePath|ConvertFrom-Json
$runtimeRoot=$hostProfile.runtimeRoot
if(-not(Test-Path -LiteralPath $runtimeRoot)){New-Item -ItemType Directory -Path $runtimeRoot -Force|Out-Null}
$runtimeRoot=(Resolve-Path $runtimeRoot).Path
$hostLog=Join-Path $runtimeRoot 'host-runner-initialization.log'
Set-Content -LiteralPath $hostLog -Value "runtime-root-ready $([datetime]::UtcNow.ToString('o'))" -Encoding utf8
$candidateProfilePath=Join-Path $PSScriptRoot $hostProfile.candidateRuntimeProfile
$launcherPath=Join-Path $PSScriptRoot $hostProfile.candidateLauncher
. $launcherPath
$gate=@();$hostDocker=Invoke-DockerCommand @('version');Add-Content -LiteralPath $hostLog -Value "docker-version-exit $($hostDocker.code)";if($hostDocker.code -ne 0){throw 'HOST_DOCKER_DAEMON_FAILURE'}
for($cycleNo=1;$cycleNo -le $Cycles;$cycleNo++){
 $id=[guid]::NewGuid().ToString('N');$run=Join-Path $runtimeRoot "cycle-$cycleNo-$id";$repo=Join-Path $run 'candidate-repository';$evidence=Join-Path $run 'evidence';$port=Port;$name="rawsqlhost$id";$label="rawsql-host-runner=$id";$ready=Join-Path $repo '.candidate-db-ready';$ack=Join-Path $repo '.parent-db-verified'
 $r=[ordered]@{result='FAIL';classification='UNCLASSIFIED';cycle=$cycleNo;id=$id;runtimeRoot=$runtimeRoot;repository=$repo;hostProcess=[ordered]@{pid=$PID;name=(Get-Process -Id $PID).ProcessName;parent=(Get-CimInstance Win32_Process -Filter "ProcessId=$PID").ParentProcessId};hostDockerDaemon=$true;port=$port;containerName=$name;label=$label;parentVerification=[ordered]@{container=$false;label=$false;postgres=$false;table=$false;row=$false;ack=$false};teardown=[ordered]@{containerRemoved=$false;noLabelLeaks=$false;portReleased=$false};error=$null}
 New-Item -ItemType Directory -Path $evidence -Force|Out-Null
 try{
  New-Item -ItemType Directory -Path $repo -Force|Out-Null;&git init -q $repo;&git -C $repo config user.email 'host-runner@example.invalid';&git -C $repo config user.name 'Benchmark Host';Set-Content (Join-Path $repo 'BASELINE.txt') 'host runner baseline' -NoNewline;&git -C $repo add BASELINE.txt;&git -C $repo commit -q -m baseline
  $r.repositoryState=[ordered]@{head=(&git -C $repo rev-parse HEAD).Trim();clean=(@(&git -C $repo status --porcelain).Count -eq 0);remotes=@(&git -C $repo remote);commits=(&git -C $repo rev-list --count HEAD).Trim()};if((-not $r.repositoryState.clean) -or $r.repositoryState.remotes.Count -ne 0 -or $r.repositoryState.commits -ne '1'){throw 'REPOSITORY_INVARIANT_FAILURE'}
  $cp=Get-Content -Raw $candidateProfilePath|ConvertFrom-Json;$prompt="Infrastructure validation only. Work only in this repository. Personally run docker version; start PostgreSQL 16 named $name labelled $label mapping $port to 5432; wait for readiness; create candidate_probe(id int primary key,note text); insert (1,'candidate-created'); query it; create empty .candidate-db-ready; wait up to 180 seconds for .parent-db-verified; then stop and remove only your own container. Do not alter Git history or any other Docker resource."
  $turn=Invoke-CandidateTurn -WorkingDirectory $repo -Model $cp.model -ReasoningEffort $cp.reasoningEffort -Sandbox $cp.sandbox -ApprovalPolicy $cp.approvalPolicy -Prompt $prompt -JsonlPath (Join-Path $evidence 'events.jsonl') -StderrPath (Join-Path $evidence 'events.stderr.txt') -FinalResponsePath (Join-Path $evidence 'final-response.txt');$r.launch=$turn.invocation
  $end=[datetime]::UtcNow.AddSeconds($TimeoutSeconds);while((-not $turn.process.HasExited) -and [datetime]::UtcNow -lt $end){if((Test-Path $ready) -and -not (Test-Path $ack)){$r.parentVerification.container=(Invoke-DockerCommand @('inspect',$name)).code -eq 0;$x=Invoke-DockerCommand @('inspect','--format','{{ index .Config.Labels "rawsql-host-runner" }}',$name);$r.parentVerification.label=($x.code -eq 0 -and $x.out[-1].Trim() -eq $id);$r.parentVerification.postgres=(Invoke-DockerCommand @('exec',$name,'pg_isready','-U','postgres','-d','postgres')).code -eq 0;$x=Invoke-DockerCommand @('exec',$name,'psql','-U','postgres','-d','postgres','-At','-c',"select to_regclass('public.candidate_probe')");$r.parentVerification.table=($x.code -eq 0 -and $x.out[-1].Trim() -eq 'candidate_probe');$x=Invoke-DockerCommand @('exec',$name,'psql','-U','postgres','-d','postgres','-At','-c','select note from candidate_probe where id=1');$r.parentVerification.row=($x.code -eq 0 -and $x.out[-1].Trim() -eq 'candidate-created');if(@($r.parentVerification.container,$r.parentVerification.label,$r.parentVerification.postgres,$r.parentVerification.table,$r.parentVerification.row) -notcontains $false){New-Item -ItemType File -Path $ack -Force|Out-Null;$r.parentVerification.ack=$true}};Start-Sleep -Milliseconds 500}
  $wait=Wait-CandidateTurn $turn ([math]::Max(1,[int]($end-[datetime]::UtcNow).TotalSeconds));$r.process=$wait;if($wait.timedOut){throw 'TIMEOUT'};if($wait.exitCode -ne 0){throw 'CANDIDATE_EXIT_FAILURE'};$event=Get-Content -Raw (Join-Path $evidence 'events.jsonl');$r.candidateEvents=[ordered]@{threadStarted=$event -match 'thread.started';turnStarted=$event -match 'turn.started';docker=$event -match 'docker version';postgres=$event -match 'postgres'};$r.teardown.containerRemoved=[string]::IsNullOrWhiteSpace(((Invoke-DockerCommand @('ps','-a','--filter',"name=^/$name$",'--format','{{.ID}}')).out -join "`n").Trim());$r.teardown.noLabelLeaks=[string]::IsNullOrWhiteSpace(((Invoke-DockerCommand @('ps','-a','--filter',"label=$label",'--format','{{.ID}}')).out -join "`n").Trim());$r.teardown.portReleased=-not (Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue);if(@($r.parentVerification.Values+$r.teardown.Values+$r.candidateEvents.Values) -contains $false){throw 'EVIDENCE_INCOMPLETE'};$r.result='PASS';$r.classification='PASS'
 }catch{$r.error=$_.Exception.Message;if($r.classification -eq 'UNCLASSIFIED'){$r.classification='HOST_RUNNER_FAILURE'}}finally{$r.finishedAtUtc=[datetime]::UtcNow.ToString('o');Json $r (Join-Path $evidence 'result.json')};$gate+=$r;if($r.result -ne 'PASS'){break}
}
$summary=[ordered]@{result=if($gate.Count -eq $Cycles -and ($gate.result -notcontains 'FAIL')){'PASS'}else{'FAIL'};cycles=$Cycles;runtimeRoot=$runtimeRoot;hostRunnerSha256=(Sha $PSCommandPath);candidateLauncherSha256=(Sha $launcherPath);candidateProfileSha256=(Sha $candidateProfilePath);runs=$gate};Json $summary (Join-Path $runtimeRoot 'host-runner-summary.json');if($summary.result -ne 'PASS'){exit 1}
