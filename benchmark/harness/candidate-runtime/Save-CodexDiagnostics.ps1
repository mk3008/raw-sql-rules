[CmdletBinding()]
param([Parameter(Mandatory)] [string] $OutputPath)
Set-StrictMode -Version Latest
$all = @(Get-Command codex -All -ErrorAction Stop | ForEach-Object { [ordered]@{ name=$_.Name; commandType=$_.CommandType.ToString(); path=$_.Path; definition=$_.Definition; extension=if($_.Path){[IO.Path]::GetExtension($_.Path)}else{$null} } })
$resolved = Get-Command codex -ErrorAction Stop
$where = @(& where.exe codex 2>&1 | ForEach-Object { $_.ToString() })
$version = @(& codex --version 2>&1 | ForEach-Object { $_.ToString() })
$help = @(& codex exec --help 2>&1 | ForEach-Object { $_.ToString() })
$report = [ordered]@{
  observedAtUtc=[DateTime]::UtcNow.ToString('o'); powerShell=$PSVersionTable; windows=(Get-ComputerInfo -Property WindowsProductName,WindowsVersion,OsBuildNumber,OsName,OsVersion | Select-Object WindowsProductName,WindowsVersion,OsBuildNumber,OsName,OsVersion)
  getCommandCodex=[ordered]@{name=$resolved.Name;commandType=$resolved.CommandType.ToString();path=$resolved.Path;definition=$resolved.Definition;extension=if($resolved.Path){[IO.Path]::GetExtension($resolved.Path)}else{$null}}
  getCommandCodexAll=$all; whereExeCodex=$where; codexVersion=$version; directNoninteractiveProbe=@{command='codex exec --help';exitCode=$LASTEXITCODE;output=$help}
}
$parent=Split-Path -Parent $OutputPath; if(-not(Test-Path -LiteralPath $parent)){New-Item -ItemType Directory -Path $parent -Force|Out-Null}
$report | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $OutputPath -Encoding utf8
