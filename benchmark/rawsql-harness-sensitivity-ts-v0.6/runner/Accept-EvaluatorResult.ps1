[CmdletBinding()]
param([Parameter(Mandatory)][string]$OutputPath)

$ErrorActionPreference='Stop'
try {
  if(-not (Test-Path -LiteralPath $OutputPath)){throw 'mechanical-primary.json was not produced'}
  $result=Get-Content -Raw -LiteralPath $OutputPath|ConvertFrom-Json
  if([string]$result.primary -notin @('PASS','FAIL')){throw 'mechanical-primary.json primary must be PASS or FAIL'}
  'PASS'
} catch {
  'FAIL'
}
