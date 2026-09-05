# Run from the repository root with: pwsh -NoProfile -File tests/installer/run.ps1
$ErrorActionPreference = 'Stop'

$root = (Resolve-Path (Join-Path $PSScriptRoot '../..')).Path
$sh = 'C:\Program Files\Git\bin\sh.exe'
$pwsh = (Get-Command pwsh -ErrorAction SilentlyContinue).Source
$start = '<!-- raw-sql-rules:start -->'
$end = '<!-- raw-sql-rules:end -->'
$rules = "# fetched Rules`n"
$passed = 0
$skipped = 0

function Assert-True([bool]$Condition, [string]$Message) {
    if (-not $Condition) { throw "ASSERTION FAILED: $Message" }
}

function Get-Bytes([string]$Path) {
    if (-not (Test-Path -LiteralPath $Path)) { return $null }
    return [Convert]::ToBase64String([System.IO.File]::ReadAllBytes($Path))
}

function New-GhStub([string]$Bin) {
    [System.IO.Directory]::CreateDirectory($Bin) | Out-Null
    $stub = @'
@echo off
if /i "%GH_STUB_MODE%"=="fail" exit /b 23
echo # fetched Rules
'@
    [System.IO.File]::WriteAllText((Join-Path $Bin 'gh.cmd'), $stub, [Text.Encoding]::ASCII)
    [System.IO.File]::WriteAllText((Join-Path $Bin 'gh'), "#!/bin/sh`nif [ `"`$GH_STUB_MODE`" = fail ]; then exit 23; fi`nprintf '%s\\n' '# fetched Rules'`n", [Text.Encoding]::ASCII)
}

function New-PosixSignalMvStub([string]$Bin) {
    $path = Join-Path $Bin 'mv'
    [IO.File]::WriteAllText($path, @'
#!/bin/sh
state=.raw-sql-rules-mv-count
count=0
[ -f "$state" ] && count=$(cat "$state")
count=$((count + 1))
printf '%s' "$count" > "$state"
/bin/mv "$@"
status=$?
if [ "$count" -eq 1 ]; then kill -TERM "$PPID"; exit 29; fi
exit "$status"
'@, [Text.Encoding]::ASCII)
    & 'C:\Program Files\Git\usr\bin\chmod.exe' '+x' $path
    if ($LASTEXITCODE -ne 0) { throw 'Could not make POSIX mv signal stub executable.' }
}

function Invoke-Target([string]$Kind, [string]$Dir, [string]$Mode, [string]$RulesPath = 'rules/installed.md', [string]$AgentsPath = 'AGENTS.md') {
    $si = [Diagnostics.ProcessStartInfo]::new()
    $si.UseShellExecute = $false
    $si.WorkingDirectory = $Dir
    $si.RedirectStandardOutput = $true
    $si.RedirectStandardError = $true
    if ($Kind -eq 'posix') {
        $posixBin = (Join-Path $Dir 'bin').Replace('\', '/')
        if ($posixBin -match '^([A-Za-z]):/(.*)$') { $posixBin = '/' + $Matches[1].ToLowerInvariant() + '/' + $Matches[2] }
        $si.Environment['PATH'] = $posixBin + ':/usr/bin:/bin'
    } else {
        $si.Environment['PATH'] = (Join-Path $Dir 'bin') + ';' + $env:PATH
    }
    $si.Environment['GH_STUB_MODE'] = $Mode
    $si.Environment['RAW_SQL_RULES_PATH'] = $RulesPath
    $si.Environment['AGENTS_FILE'] = $AgentsPath
    if ($Kind -eq 'posix') {
        $si.FileName = $sh
        $si.ArgumentList.Add('-c')
        $si.ArgumentList.Add("PATH='${posixBin}:/usr/bin:/bin'; export PATH; ./install.sh")
    } else {
        $si.FileName = $pwsh
        $si.ArgumentList.Add('-NoProfile')
        $si.ArgumentList.Add('-File')
        $si.ArgumentList.Add('./install.ps1')
    }
    $p = [Diagnostics.Process]::new()
    $p.StartInfo = $si
    $null = $p.Start()
    $stdout = $p.StandardOutput.ReadToEnd()
    $stderr = $p.StandardError.ReadToEnd()
    $p.WaitForExit()
    [pscustomobject]@{ Code = $p.ExitCode; Stdout = $stdout; Stderr = $stderr }
}

function Invoke-Case([string]$Kind, [string]$Name, [string]$Agents, [string]$InitialRules, [string]$Mode = 'ok', [bool]$ExpectSuccess = $true, [scriptblock]$Check) {
    $dir = Join-Path $base "$Kind-$Name"
    [System.IO.Directory]::CreateDirectory($dir) | Out-Null
    Copy-Item -LiteralPath (Join-Path $root 'install.sh') -Destination (Join-Path $dir 'install.sh')
    Copy-Item -LiteralPath (Join-Path $root 'install.ps1') -Destination (Join-Path $dir 'install.ps1')
    New-GhStub (Join-Path $dir 'bin')
    if ($null -ne $Agents) { [System.IO.File]::WriteAllText((Join-Path $dir 'AGENTS.md'), $Agents, [Text.UTF8Encoding]::new($false)) }
    if ($null -ne $InitialRules) {
        [System.IO.Directory]::CreateDirectory((Join-Path $dir 'rules')) | Out-Null
        [System.IO.File]::WriteAllText((Join-Path $dir 'rules/installed.md'), $InitialRules, [Text.UTF8Encoding]::new($false))
    }
    $beforeAgents = Get-Bytes (Join-Path $dir 'AGENTS.md')
    $beforeRules = Get-Bytes (Join-Path $dir 'rules/installed.md')
    $result = Invoke-Target $Kind $dir $Mode
    Assert-True (($result.Code -eq 0) -eq $ExpectSuccess) "$Kind/$Name exit=$($result.Code) stderr=$($result.Stderr)"
    if (-not $ExpectSuccess) {
        Assert-True ((Get-Bytes (Join-Path $dir 'AGENTS.md')) -ceq $beforeAgents) "$Kind/$Name changed AGENTS on failure"
        Assert-True ((Get-Bytes (Join-Path $dir 'rules/installed.md')) -ceq $beforeRules) "$Kind/$Name changed Rules on failure"
    }
    if ($Check) { & $Check $dir $result }
    $script:passed++
}

$base = Join-Path ([IO.Path]::GetTempPath()) ("raw-sql-installer-tests-" + [guid]::NewGuid().ToString('N'))
[IO.Directory]::CreateDirectory($base) | Out-Null
try {
    $kinds = @()
    if (Test-Path -LiteralPath $sh) { $kinds += 'posix' } else { Write-Output 'SKIP posix: Git sh.exe unavailable'; $skipped++ }
    if ($pwsh) { $kinds += 'powershell' } else { Write-Output 'SKIP powershell: pwsh unavailable'; $skipped++ }
    foreach ($kind in $kinds) {
        Invoke-Case $kind 'empty-agents' '' $null 'ok' $true {
            param($d) $text = [IO.File]::ReadAllText((Join-Path $d 'AGENTS.md')); Assert-True ($text.Contains($start) -and $text.Contains($end)) "$kind empty AGENTS was not initialized"
        }

        Invoke-Case $kind 'no-block' "human guidance`n" $null 'ok' $true {
            param($d) $text = [IO.File]::ReadAllText((Join-Path $d 'AGENTS.md')); Assert-True (($text.Split($start).Count - 1) -eq 1) "$kind no-block marker count"; Assert-True $text.Contains('human guidance') 'suffix lost'
        }

        Invoke-Case $kind 'repeat' "human`n$start`nold`n$end`nsuffix`n" 'old Rules' 'ok' $true {
            param($d) $path = Join-Path $d 'AGENTS.md'; $first = Get-Bytes $path; $r = Invoke-Target $kind $d 'ok'; Assert-True ($r.Code -eq 0) 'repeat run failed'; $second = Get-Bytes $path; Assert-True ($first -ceq $second) 'repeat was not idempotent'; Assert-True ([IO.File]::ReadAllText($path).Contains('suffix')) 'suffix lost'
        }

        Invoke-Case $kind 'suffix-without-final-newline' "before`n$start`nold`n$end`nsuffix" 'old Rules' 'ok' $true {
            param($d) $bytes = [IO.File]::ReadAllBytes((Join-Path $d 'AGENTS.md')); $suffix = [Text.Encoding]::UTF8.GetBytes('suffix'); Assert-True ($bytes.Length -ge $suffix.Length) "$kind suffix missing"; $actualSuffix = [Convert]::ToBase64String($bytes[($bytes.Length - $suffix.Length)..($bytes.Length - 1)]); $expectedSuffix = [Convert]::ToBase64String($suffix); Assert-True ($actualSuffix -ceq $expectedSuffix) "$kind suffix final newline changed"
        }

        $crlf = "before`r`n$start   `r`nold`r`n$end`t`r`nafter`r`n"
        Invoke-Case $kind 'crlf-trailing' $crlf 'old Rules' 'ok' $true {
            param($d) $bytes = [IO.File]::ReadAllBytes((Join-Path $d 'AGENTS.md')); $text = [Text.Encoding]::UTF8.GetString($bytes); Assert-True $text.Contains('after') "$kind CRLF suffix lost"; Assert-True (($text.Split($start).Count - 1) -eq 1) "$kind CRLF marker count"
        }

        Invoke-Case $kind 'missing-end' "$start`nbody`n" 'old Rules' 'ok' $false
        Invoke-Case $kind 'missing-start' "body`n$end`n" 'old Rules' 'ok' $false
        Invoke-Case $kind 'ambiguous' "$start`n$start`nbody`n$end`n" 'old Rules' 'ok' $false
        Invoke-Case $kind 'embedded-marker' "before $start`nbody`n" 'old Rules' 'ok' $false
        Invoke-Case $kind 'end-before-start' "$end`nbody`n$start`n" 'old Rules' 'ok' $false
        Invoke-Case $kind 'download-failure' "human`n" 'old Rules' 'fail' $false

        $samePathDir = Join-Path $base "$kind-same-path"
        [IO.Directory]::CreateDirectory($samePathDir) | Out-Null
        Copy-Item -LiteralPath (Join-Path $root 'install.sh') -Destination (Join-Path $samePathDir 'install.sh')
        Copy-Item -LiteralPath (Join-Path $root 'install.ps1') -Destination (Join-Path $samePathDir 'install.ps1')
        New-GhStub (Join-Path $samePathDir 'bin')
        [IO.File]::WriteAllText((Join-Path $samePathDir 'AGENTS.md'), "original`n", [Text.UTF8Encoding]::new($false))
        $before = Get-Bytes (Join-Path $samePathDir 'AGENTS.md')
        $samePathResult = Invoke-Target $kind $samePathDir 'ok' './AGENTS.md' 'AGENTS.md'
        Assert-True ($samePathResult.Code -ne 0) "$kind same target paths unexpectedly succeeded"
        Assert-True ((Get-Bytes (Join-Path $samePathDir 'AGENTS.md')) -ceq $before) "$kind same target paths changed AGENTS"
        $script:passed++

        if ($kind -eq 'powershell') {
            $casePathResult = Invoke-Target 'powershell' $samePathDir 'ok' '.\agents.md' 'AGENTS.md'
            Assert-True ($casePathResult.Code -ne 0) 'powershell case-only target paths unexpectedly succeeded'
            Assert-True ((Get-Bytes (Join-Path $samePathDir 'AGENTS.md')) -ceq $before) 'powershell case-only target paths changed AGENTS'
            $script:passed++

            $rollbackDir = Join-Path $base 'powershell-rollback'
            [IO.Directory]::CreateDirectory($rollbackDir) | Out-Null
            Copy-Item -LiteralPath (Join-Path $root 'install.ps1') -Destination (Join-Path $rollbackDir 'install.ps1')
            New-GhStub (Join-Path $rollbackDir 'bin')
            $lockedAgents = Join-Path $rollbackDir 'AGENTS.md'
            [IO.File]::WriteAllText($lockedAgents, "human`n", [Text.UTF8Encoding]::new($false))
            [IO.Directory]::CreateDirectory((Join-Path $rollbackDir 'rules')) | Out-Null
            [IO.File]::WriteAllText((Join-Path $rollbackDir 'rules/installed.md'), 'old Rules', [Text.UTF8Encoding]::new($false))
            $agentsBefore = Get-Bytes $lockedAgents; $rulesBefore = Get-Bytes (Join-Path $rollbackDir 'rules/installed.md')
            $lock = [IO.File]::Open($lockedAgents, [IO.FileMode]::Open, [IO.FileAccess]::Read, [IO.FileShare]::Read)
            try { $rollbackResult = Invoke-Target 'powershell' $rollbackDir 'ok' }
            finally { $lock.Dispose() }
            Assert-True ($rollbackResult.Code -ne 0) 'powershell locked AGENTS unexpectedly succeeded'
            Assert-True ((Get-Bytes $lockedAgents) -ceq $agentsBefore) 'powershell rollback changed AGENTS'
            Assert-True ((Get-Bytes (Join-Path $rollbackDir 'rules/installed.md')) -ceq $rulesBefore) 'powershell rollback changed Rules'
            $script:passed++
        }
        if ($kind -eq 'posix') {
            $signalDir = Join-Path $base 'posix-signal-rollback'
            [IO.Directory]::CreateDirectory($signalDir) | Out-Null
            Copy-Item -LiteralPath (Join-Path $root 'install.sh') -Destination (Join-Path $signalDir 'install.sh')
            New-GhStub (Join-Path $signalDir 'bin')
            New-PosixSignalMvStub (Join-Path $signalDir 'bin')
            [IO.File]::WriteAllText((Join-Path $signalDir 'AGENTS.md'), "human`n", [Text.UTF8Encoding]::new($false))
            [IO.Directory]::CreateDirectory((Join-Path $signalDir 'rules')) | Out-Null
            [IO.File]::WriteAllText((Join-Path $signalDir 'rules/installed.md'), 'old Rules', [Text.UTF8Encoding]::new($false))
            $agentsBefore = Get-Bytes (Join-Path $signalDir 'AGENTS.md'); $rulesBefore = Get-Bytes (Join-Path $signalDir 'rules/installed.md')
            $signalResult = Invoke-Target 'posix' $signalDir 'ok'
            Assert-True ($signalResult.Code -ne 0) 'posix signal interruption unexpectedly succeeded'
            Assert-True ((Get-Bytes (Join-Path $signalDir 'AGENTS.md')) -ceq $agentsBefore) 'posix signal rollback changed AGENTS'
            Assert-True ((Get-Bytes (Join-Path $signalDir 'rules/installed.md')) -ceq $rulesBefore) 'posix signal rollback changed Rules'
            $script:passed++
        }
    }
    Write-Output "PASS installer regression cases: $passed (skipped runtimes: $skipped)"
}
finally {
    if (Test-Path -LiteralPath $base) { Remove-Item -LiteralPath $base -Recurse -Force }
}
