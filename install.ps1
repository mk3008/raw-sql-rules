$ErrorActionPreference = 'Stop'

$Repository = 'mk3008/raw-sql-rules'
$Ref = if ($env:RAW_SQL_RULES_REF) { $env:RAW_SQL_RULES_REF } else { 'main' }
$RulesPath = if ($env:RAW_SQL_RULES_PATH) { $env:RAW_SQL_RULES_PATH } else { 'rules/raw-sql-rules.md' }
$AgentsFile = if ($env:AGENTS_FILE) { $env:AGENTS_FILE } else { 'AGENTS.md' }
$Start = '<!-- raw-sql-rules:start -->'
$End = '<!-- raw-sql-rules:end -->'

function Require-Command([string]$Name) {
    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "raw-sql-rules: required command not found: $Name"
    }
}

function Get-FileSha256([string]$Path) {
    (Get-FileHash -Algorithm SHA256 -LiteralPath $Path).Hash
}

function Invoke-GhRawToFile([string]$Endpoint, [string]$OutputPath) {
    $startInfo = [System.Diagnostics.ProcessStartInfo]::new()
    $startInfo.FileName = (Get-Command gh -ErrorAction Stop).Source
    $startInfo.UseShellExecute = $false
    $startInfo.RedirectStandardOutput = $true
    $startInfo.RedirectStandardError = $true
    $startInfo.ArgumentList.Add('api')
    $startInfo.ArgumentList.Add($Endpoint)
    $startInfo.ArgumentList.Add('-H')
    $startInfo.ArgumentList.Add('Accept: application/vnd.github.raw+json')

    $process = [System.Diagnostics.Process]::new()
    $process.StartInfo = $startInfo
    $null = $process.Start()
    try {
        $output = [System.IO.File]::Open($OutputPath, [System.IO.FileMode]::Create, [System.IO.FileAccess]::Write)
        try { $process.StandardOutput.BaseStream.CopyTo($output) }
        finally { $output.Dispose() }

        $standardError = $process.StandardError.ReadToEnd()
        $process.WaitForExit()
        if ($process.ExitCode -ne 0) {
            throw "raw-sql-rules: GitHub CLI request failed: $standardError"
        }
    }
    finally { $process.Dispose() }
}

function Get-LineRecords([string]$Text) {
    $records = [System.Collections.Generic.List[object]]::new()
    $pattern = '(?<text>[^\r\n]*)(?<eol>\r\n|\n|\r|$)'
    foreach ($match in [regex]::Matches($Text, $pattern)) {
        if ($match.Length -eq 0) { continue }
        $records.Add([pscustomobject]@{
            Text = $match.Groups['text'].Value
            Eol = $match.Groups['eol'].Value
            Index = $match.Index
            Length = $match.Length
        })
    }
    return $records
}

function Test-MarkerLine([string]$Text, [string]$Marker) {
    $Text.TrimEnd(' ', "`t") -ceq $Marker
}

function Get-ManagedBlockInfo([string]$Text) {
    $records = Get-LineRecords $Text
    $starts = [System.Collections.Generic.List[object]]::new()
    $ends = [System.Collections.Generic.List[object]]::new()
    $ambiguous = $false
    foreach ($record in $records) {
        $isStart = Test-MarkerLine $record.Text $Start
        $isEnd = Test-MarkerLine $record.Text $End
        if ($isStart) { $starts.Add($record) }
        elseif ($isEnd) { $ends.Add($record) }
        elseif ($record.Text.Contains($Start, [System.StringComparison]::Ordinal) -or
                $record.Text.Contains($End, [System.StringComparison]::Ordinal)) {
            $ambiguous = $true
        }
    }
    [pscustomobject]@{
        Records = $records
        Starts = $starts
        Ends = $ends
        Ambiguous = $ambiguous
        ValidPair = (-not $ambiguous -and $starts.Count -eq 1 -and $ends.Count -eq 1 -and
            $starts[0].Index -lt $ends[0].Index)
    }
}

function New-AgentsCandidate([string]$Existing, [string]$ManagedBlock) {
    if ($null -eq $Existing) { return $ManagedBlock + [Environment]::NewLine }

    $info = Get-ManagedBlockInfo $Existing
    if ($info.Ambiguous -or $info.Starts.Count -gt 1 -or $info.Ends.Count -gt 1 -or
        $info.Starts.Count -ne $info.Ends.Count -or
        ($info.Starts.Count -eq 1 -and -not $info.ValidPair)) {
        throw "raw-sql-rules: $AgentsFile contains an incomplete, ambiguous, or duplicated managed block; not modifying it."
    }

    $lineEnding = ($info.Records | Where-Object { $_.Eol.Length -gt 0 } | Select-Object -First 1).Eol
    if ([string]::IsNullOrEmpty($lineEnding)) { $lineEnding = [Environment]::NewLine }
    $managedWithEnding = $ManagedBlock.Replace("`n", $lineEnding)

    if ($info.Starts.Count -eq 0) {
        if ($Existing.Length -eq 0) { return $managedWithEnding + $lineEnding }
        return $Existing + $lineEnding + $managedWithEnding + $lineEnding
    }

    $startRecord = $info.Starts[0]
    $endRecord = $info.Ends[0]
    $prefix = $Existing.Substring(0, $startRecord.Index)
    $suffixStart = $endRecord.Index + $endRecord.Length
    $suffix = $Existing.Substring($suffixStart)
    $replacement = $managedWithEnding
    if ($endRecord.Eol.Length -gt 0) { $replacement += $endRecord.Eol }
    return $prefix + $replacement + $suffix
}

Require-Command gh

$workingDirectory = (Get-Location).Path
$rulesFullPath = if ([System.IO.Path]::IsPathFullyQualified($RulesPath)) {
    [System.IO.Path]::GetFullPath($RulesPath)
} else { [System.IO.Path]::GetFullPath((Join-Path $workingDirectory $RulesPath)) }
$agentsFullPath = if ([System.IO.Path]::IsPathFullyQualified($AgentsFile)) {
    [System.IO.Path]::GetFullPath($AgentsFile)
} else { [System.IO.Path]::GetFullPath((Join-Path $workingDirectory $AgentsFile)) }
if ([string]::Equals($rulesFullPath, $agentsFullPath, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw 'raw-sql-rules: Rules and AGENTS paths must be different.'
}

$temporaryRules = [System.IO.Path]::GetTempFileName()
$temporaryAgents = [System.IO.Path]::GetTempFileName()
$rulesBackup = [System.IO.Path]::GetTempFileName()
$agentsBackup = [System.IO.Path]::GetTempFileName()
$rulesMayHaveChanged = $false
$agentsMayHaveChanged = $false
$rulesExisted = Test-Path -LiteralPath $rulesFullPath
$agentsExisted = Test-Path -LiteralPath $agentsFullPath

try {
    Invoke-GhRawToFile "repos/$Repository/contents/raw-sql-rules.md?ref=$Ref" $temporaryRules
    if ((Get-Item -LiteralPath $temporaryRules).Length -eq 0) {
        throw 'raw-sql-rules: downloaded Rules file is empty.'
    }
    $sourceHash = Get-FileSha256 $temporaryRules

    $managedBlock = @(
        $Start,
        '## Raw SQL',
        '',
        "For Raw SQL data-access work, read ``$RulesPath`` and follow it",
        'as the repository contract.',
        $End
    ) -join "`n"
    $existingAgents = if ($agentsExisted) { [System.IO.File]::ReadAllText($agentsFullPath) } else { $null }
    $agentsCandidate = New-AgentsCandidate $existingAgents $managedBlock
    $candidateInfo = Get-ManagedBlockInfo $agentsCandidate
    if (-not $candidateInfo.ValidPair -or $candidateInfo.Starts.Count -ne 1 -or $candidateInfo.Ends.Count -ne 1) {
        throw 'raw-sql-rules: generated managed block is invalid; not modifying targets.'
    }
    [System.IO.File]::WriteAllText($temporaryAgents, $agentsCandidate, [System.Text.UTF8Encoding]::new($false))

    $rulesDirectory = Split-Path -Parent $rulesFullPath
    $agentsDirectory = Split-Path -Parent $agentsFullPath
    [System.IO.Directory]::CreateDirectory($rulesDirectory) | Out-Null
    [System.IO.Directory]::CreateDirectory($agentsDirectory) | Out-Null
    if ($rulesExisted) { [System.IO.File]::Copy($rulesFullPath, $rulesBackup, $true) }
    if ($agentsExisted) { [System.IO.File]::Copy($agentsFullPath, $agentsBackup, $true) }

    try {
        $rulesMayHaveChanged = $true
        [System.IO.File]::Move($temporaryRules, $rulesFullPath, $true)
        $agentsMayHaveChanged = $true
        [System.IO.File]::Move($temporaryAgents, $agentsFullPath, $true)
        if ((Get-FileSha256 $rulesFullPath) -ne $sourceHash) {
            throw 'raw-sql-rules: installed Rules SHA-256 does not match downloaded source.'
        }
    }
    catch {
        $originalError = $_
        $rollbackErrors = [System.Collections.Generic.List[string]]::new()
        if ($agentsMayHaveChanged) {
            try {
                if ($agentsExisted) { [System.IO.File]::Copy($agentsBackup, $agentsFullPath, $true) }
                else { Remove-Item -LiteralPath $agentsFullPath -Force -ErrorAction Stop }
            }
            catch { $rollbackErrors.Add("AGENTS rollback failed: $($_.Exception.Message)") }
        }
        if ($rulesMayHaveChanged) {
            try {
                if ($rulesExisted) { [System.IO.File]::Copy($rulesBackup, $rulesFullPath, $true) }
                else { Remove-Item -LiteralPath $rulesFullPath -Force -ErrorAction Stop }
            }
            catch { $rollbackErrors.Add("Rules rollback failed: $($_.Exception.Message)") }
        }
        if ($rollbackErrors.Count -gt 0) { throw "raw-sql-rules: $($originalError.Exception.Message); $($rollbackErrors -join '; ')" }
        throw
    }

    Write-Output "Installed $RulesPath from $Repository@$Ref"
    Write-Output "Updated $AgentsFile"
    Write-Output "Rules SHA-256: $sourceHash"
}
finally {
    foreach ($temporaryPath in @($temporaryRules, $temporaryAgents, $rulesBackup, $agentsBackup)) {
        if ($temporaryPath -and (Test-Path -LiteralPath $temporaryPath)) {
            Remove-Item -LiteralPath $temporaryPath -Force -ErrorAction SilentlyContinue
        }
    }
}
