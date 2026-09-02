[CmdletBinding()]
param([Parameter(Mandatory)][string]$EvidenceRoot)

$ErrorActionPreference='Stop'
New-Item -ItemType Directory -Force -Path $EvidenceRoot|Out-Null
function Write-Json($Value,$Path){$Value|ConvertTo-Json -Depth 8|Set-Content -LiteralPath $Path -Encoding utf8}
$helper=Join-Path $PSScriptRoot 'Accept-EvaluatorResult.ps1'
$records=@()
foreach($primary in @('FAIL','PASS')){
  $output=Join-Path $EvidenceRoot ("mechanical-primary-$primary.json")
  Write-Json @{task='S02';primary=$primary;confirmedDefects=@();states=@{}} $output
  $slots=@('S02-Control','S01-Treatment');$slotIndex=0
  $accepted=((& $helper -OutputPath $output) -eq 'PASS')
  if(-not $accepted){throw "valid primary=$primary was not accepted"}
  $slotIndex++
  $records+=@{primary=$primary;accepted=$accepted;nextSlot=$slots[$slotIndex]}
}
$result=@{result='PASS';dockerUsed=$false;candidateLaunched=$false;cases=$records}
Write-Json $result (Join-Path $EvidenceRoot 'REGRESSION-SUMMARY.json')
