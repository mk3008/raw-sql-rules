[CmdletBinding()]
param(
  [Parameter(Mandatory)][string]$StudyRoot,
  [Parameter(Mandatory)][string]$RunRoot,
  [Parameter(Mandatory)][string]$Slot,
  [Parameter(Mandatory)][string]$ReviewId
)

$ErrorActionPreference='Stop'
$packet=Join-Path $RunRoot "blind-review-$ReviewId"
if(-not (Test-Path -LiteralPath $packet)){
  New-Item -ItemType Directory -Path $packet|Out-Null
  $source=Join-Path (Join-Path $RunRoot $Slot) 'final-source'
  if(-not(Test-Path -LiteralPath $source)){throw "Missing frozen source for $Slot"}
  Get-ChildItem -Force $source|Where-Object{$_.Name -notin @('AGENTS.md','rules','SOURCE-MANIFEST.json')}|Copy-Item -Destination $packet -Recurse -Force
  Copy-Item -LiteralPath (Join-Path $StudyRoot "prompts/$($Slot.Substring(0,3)).txt") -Destination (Join-Path $packet 'BUSINESS-REQUIREMENT.txt')
  Copy-Item -LiteralPath (Join-Path $StudyRoot 'fixture/database/schema/001_inventory.sql') -Destination (Join-Path $packet 'CANONICAL-DDL.sql')
}
if(-not(Test-Path -LiteralPath (Join-Path $packet '.git'))){
  git -C $packet init -q
  git -C $packet config user.email reviewer@example.invalid
  git -C $packet config user.name reviewer
  git -C $packet add .
  git -C $packet commit -q -m baseline
}
if((git -C $packet rev-list --count HEAD).Trim() -ne '1'){throw "Review packet must have one commit: $ReviewId"}
if(@(git -C $packet remote).Count -ne 0){throw "Review packet must have no remote: $ReviewId"}
$packet
