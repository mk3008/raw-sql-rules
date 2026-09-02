param(
  [Parameter(Mandatory)] [string] $Source,
  [Parameter(Mandatory)] [string] $Destination
)

Set-StrictMode -Version Latest

$sourcePath = (Resolve-Path -LiteralPath $Source -ErrorAction Stop).Path
if (-not (Test-Path -LiteralPath $sourcePath -PathType Container)) {
  throw ('Fixture source is not a directory: {0}' -f $sourcePath)
}

New-Item -ItemType Directory -Path $Destination -Force | Out-Null
$items = @(Get-ChildItem -LiteralPath $sourcePath -Force)
if ($items.Count -eq 0) {
  throw ('Fixture source is empty: {0}' -f $sourcePath)
}

foreach ($item in $items) {
  Copy-Item -LiteralPath $item.FullName -Destination $Destination -Recurse -Force
}
