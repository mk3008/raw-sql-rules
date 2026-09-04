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
    $startInfo.FileName = 'gh'
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
        try {
            $process.StandardOutput.BaseStream.CopyTo($output)
        }
        finally {
            $output.Dispose()
        }

        $standardError = $process.StandardError.ReadToEnd()
        $process.WaitForExit()
        if ($process.ExitCode -ne 0) {
            throw "raw-sql-rules: GitHub CLI request failed: $standardError"
        }
    }
    finally {
        $process.Dispose()
    }
}

Require-Command gh

$workingDirectory = (Get-Location).Path
$rulesFullPath = if ([System.IO.Path]::IsPathFullyQualified($RulesPath)) {
    [System.IO.Path]::GetFullPath($RulesPath)
} else {
    [System.IO.Path]::GetFullPath((Join-Path $workingDirectory $RulesPath))
}
$agentsFullPath = if ([System.IO.Path]::IsPathFullyQualified($AgentsFile)) {
    [System.IO.Path]::GetFullPath($AgentsFile)
} else {
    [System.IO.Path]::GetFullPath((Join-Path $workingDirectory $AgentsFile))
}
$rulesDirectory = Split-Path -Parent $rulesFullPath
[System.IO.Directory]::CreateDirectory($rulesDirectory) | Out-Null
$agentsDirectory = Split-Path -Parent $agentsFullPath
[System.IO.Directory]::CreateDirectory($agentsDirectory) | Out-Null

$temporaryRules = [System.IO.Path]::GetTempFileName()
try {
    Invoke-GhRawToFile "repos/$Repository/contents/raw-sql-rules.md?ref=$Ref" $temporaryRules

    $sourceHash = Get-FileSha256 $temporaryRules
    $installedHash = if (Test-Path -LiteralPath $rulesFullPath) { Get-FileSha256 $rulesFullPath } else { $null }
    if ($sourceHash -ne $installedHash) {
        [System.IO.File]::Move($temporaryRules, $rulesFullPath, $true)
        $temporaryRules = $null
    }

    $lineEnding = [Environment]::NewLine
    $managedBlock = @(
        $Start,
        '## Raw SQL',
        '',
        "For Raw SQL data-access work, read ``$RulesPath`` and follow it",
        'as the repository contract.',
        $End
    ) -join $lineEnding

    if (-not (Test-Path -LiteralPath $agentsFullPath)) {
        [System.IO.File]::WriteAllText($agentsFullPath, $managedBlock + $lineEnding, [System.Text.UTF8Encoding]::new($false))
    }
    else {
        $existing = [System.IO.File]::ReadAllText($agentsFullPath)
        $hasStart = $existing.Contains($Start, [System.StringComparison]::Ordinal)
        $hasEnd = $existing.Contains($End, [System.StringComparison]::Ordinal)
        if ($hasStart -ne $hasEnd) {
            throw "raw-sql-rules: $AgentsFile contains an incomplete managed block; not modifying it."
        }

        $updated = if ($hasStart) {
            $pattern = "(?s)$([regex]::Escape($Start)).*?$([regex]::Escape($End))"
            [regex]::Replace($existing, $pattern, [System.Text.RegularExpressions.MatchEvaluator]{ param($match) $managedBlock }, 1)
        }
        elseif ($existing.Length -eq 0) {
            $managedBlock + $lineEnding
        }
        else {
            $existing + $lineEnding + $managedBlock + $lineEnding
        }

        if (-not [string]::Equals($existing, $updated, [System.StringComparison]::Ordinal)) {
            [System.IO.File]::WriteAllText($agentsFullPath, $updated, [System.Text.UTF8Encoding]::new($false))
        }
    }

    $finalInstalledHash = Get-FileSha256 $rulesFullPath
    if ($finalInstalledHash -ne $sourceHash) {
        throw 'raw-sql-rules: installed Rules SHA-256 does not match downloaded source.'
    }

    Write-Output "Installed $RulesPath from $Repository@$Ref"
    Write-Output "Updated $AgentsFile"
    Write-Output "Rules SHA-256: $sourceHash"
}
finally {
    if ($temporaryRules -and (Test-Path -LiteralPath $temporaryRules)) {
        Remove-Item -LiteralPath $temporaryRules -Force
    }
}
