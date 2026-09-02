param(
    [Parameter(Mandatory)][ValidateSet('Control','Treatment')][string]$Arm,
    [Parameter(Mandatory)][string]$CandidatePath,
    [Parameter(Mandatory)][string]$IdentityOutputPath
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent (Split-Path -Parent $PSCommandPath)
$fixture = Join-Path $root 'fixture'
if (Test-Path -LiteralPath $CandidatePath) { throw "Candidate path already exists: $CandidatePath" }

New-Item -ItemType Directory -Path $CandidatePath | Out-Null
Copy-Item -Path (Join-Path $fixture '*') -Destination $CandidatePath -Recurse -Force
# Dependencies are qualification byproducts, not part of the canonical fixture packet.
$copiedNodeModules = Join-Path $CandidatePath 'node_modules'
if (Test-Path -LiteralPath $copiedNodeModules) { Remove-Item -LiteralPath $copiedNodeModules -Recurse -Force }

$identity = [ordered]@{
    arm = $Arm
    candidatePath = $CandidatePath
    releasedProductCommit = $null
    rawSqlRulesPresent = $false
    managedTreatmentBlockPresent = $false
    rulesSha256 = $null
    baselineCommit = $null
    gitCommitCount = $null
    gitStatus = $null
    gitRemotes = $null
    pass = $false
}

if ($Arm -eq 'Treatment') {
    $identity.releasedProductCommit = 'dceb234b42ffa7b32c1a54e0cce0666580c8f68f'
    $savedRef, $savedRulesPath, $savedAgents = $env:RAW_SQL_RULES_REF, $env:RAW_SQL_RULES_PATH, $env:AGENTS_FILE
    try {
        $env:RAW_SQL_RULES_REF = $identity.releasedProductCommit
        $env:RAW_SQL_RULES_PATH = 'rules/raw-sql-rules.md'
        $env:AGENTS_FILE = 'AGENTS.md'
        Push-Location $CandidatePath
        try { & (Join-Path $PSScriptRoot 'released-v0.1.0-install.ps1') }
        finally { Pop-Location }
    }
    finally {
        $env:RAW_SQL_RULES_REF = $savedRef
        $env:RAW_SQL_RULES_PATH = $savedRulesPath
        $env:AGENTS_FILE = $savedAgents
    }
    $rules = Join-Path $CandidatePath 'rules/raw-sql-rules.md'
    $agents = Join-Path $CandidatePath 'AGENTS.md'
    $identity.rawSqlRulesPresent = Test-Path -LiteralPath $rules
    $identity.managedTreatmentBlockPresent = (Test-Path -LiteralPath $agents) -and ((Get-Content -Raw -LiteralPath $agents) -match '<!-- raw-sql-rules:start -->') -and ((Get-Content -Raw -LiteralPath $agents) -match '<!-- raw-sql-rules:end -->')
    if ($identity.rawSqlRulesPresent) { $identity.rulesSha256 = (Get-FileHash -Algorithm SHA256 -LiteralPath $rules).Hash.ToLower() }
    if (-not $identity.rawSqlRulesPresent -or -not $identity.managedTreatmentBlockPresent) { throw 'Treatment artifact identity failed' }
}
else {
    $rules = Join-Path $CandidatePath 'rules/raw-sql-rules.md'
    $managed = Get-ChildItem -LiteralPath $CandidatePath -Recurse -Force -Filter AGENTS.md | Where-Object { (Get-Content -Raw -LiteralPath $_.FullName) -match '<!-- raw-sql-rules:start -->|<!-- raw-sql-rules:end -->' }
    $identity.rawSqlRulesPresent = Test-Path -LiteralPath $rules
    $identity.managedTreatmentBlockPresent = @($managed).Count -gt 0
    if ($identity.rawSqlRulesPresent -or $identity.managedTreatmentBlockPresent) { throw 'Control contamination detected' }
}

Push-Location $CandidatePath
try {
    git init | Out-Null
    git config user.name 'Raw SQL Sensitivity Fixture'
    git config user.email 'rawsql-sensitivity@example.invalid'
    git add -A
    git commit -m 'baseline fixture' | Out-Null
    $identity.baselineCommit = (git rev-parse HEAD).Trim()
    $identity.gitCommitCount = [int](git rev-list --count HEAD)
    $identity.gitStatus = @(git status --porcelain)
    $identity.gitRemotes = @(git remote)
}
finally { Pop-Location }

if ($identity.gitCommitCount -ne 1) { throw 'Candidate baseline does not have exactly one commit' }
if (@($identity.gitStatus).Count -ne 0) { throw 'Candidate baseline working tree is not clean' }
if (@($identity.gitRemotes).Count -ne 0) { throw 'Candidate baseline has a remote' }
$identity.pass = $true
$identity | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $IdentityOutputPath
