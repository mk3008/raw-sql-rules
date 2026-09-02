Set-StrictMode -Version Latest

function Resolve-CodexLaunchCommand {
  [CmdletBinding()]
  param()

  $all = @(Get-Command codex -All -ErrorAction Stop)
  $native = @($all | Where-Object {
    $_.CommandType -eq 'Application' -and $_.Path -and
    [System.IO.Path]::GetExtension($_.Path).ToLowerInvariant() -eq '.exe'
  } | Select-Object -First 1)
  if ($native.Count -ne 1) {
    throw 'No native codex.exe command was found on PATH. This Windows launcher intentionally requires the installed native Codex executable.'
  }

  $item = Get-Item -LiteralPath $native[0].Path -ErrorAction Stop
  [pscustomobject]@{
    fileName = $item.FullName
    commandType = $native[0].CommandType.ToString()
    extension = $item.Extension
    resolution = 'Get-Command codex -All; first Application with .exe extension'
  }
}

function Invoke-CandidateTurn {
  [CmdletBinding()]
  param(
    [Parameter(Mandatory)] [string] $WorkingDirectory,
    [Parameter(Mandatory)] [string] $Model,
    [Parameter(Mandatory)] [string] $ReasoningEffort,
    [Parameter(Mandatory)] [ValidateSet('read-only', 'workspace-write', 'danger-full-access')] [string] $Sandbox,
    [Parameter(Mandatory)] [ValidateSet('never', 'on-request', 'on-failure', 'untrusted')] [string] $ApprovalPolicy,
    [Parameter(Mandatory)] [string] $Prompt,
    [Parameter(Mandatory)] [string] $JsonlPath,
    [Parameter(Mandatory)] [string] $StderrPath,
    [Parameter(Mandatory)] [string] $FinalResponsePath
  )

  if (-not (Test-Path -LiteralPath $WorkingDirectory -PathType Container)) { throw "Working directory does not exist: $WorkingDirectory" }
  foreach ($path in @($JsonlPath, $StderrPath, $FinalResponsePath)) {
    $parent = Split-Path -Parent $path
    if (-not (Test-Path -LiteralPath $parent -PathType Container)) { New-Item -ItemType Directory -Path $parent -Force | Out-Null }
  }
  $launch = Resolve-CodexLaunchCommand
  $arguments = @('exec', '--json', '--color', 'never', '-o', $FinalResponsePath, '-m', $Model,
    '-c', "model_reasoning_effort=`"$ReasoningEffort`"", '-c', "approval_policy=`"$ApprovalPolicy`"",
    '-s', $Sandbox, '-C', $WorkingDirectory, $Prompt)

  $psi = [System.Diagnostics.ProcessStartInfo]::new()
  $psi.FileName = $launch.fileName
  $psi.WorkingDirectory = $WorkingDirectory
  $psi.UseShellExecute = $false
  $psi.RedirectStandardOutput = $true
  $psi.RedirectStandardError = $true
  $psi.CreateNoWindow = $true
  foreach ($argument in $arguments) { [void]$psi.ArgumentList.Add($argument) }

  $process = [System.Diagnostics.Process]::new()
  $process.StartInfo = $psi
  if (-not $process.Start()) { throw 'Codex process did not start.' }
  $stdout = [System.IO.File]::Open($JsonlPath, [System.IO.FileMode]::Create, [System.IO.FileAccess]::Write, [System.IO.FileShare]::Read)
  $stderr = [System.IO.File]::Open($StderrPath, [System.IO.FileMode]::Create, [System.IO.FileAccess]::Write, [System.IO.FileShare]::Read)
  $stdoutTask = $process.StandardOutput.BaseStream.CopyToAsync($stdout)
  $stderrTask = $process.StandardError.BaseStream.CopyToAsync($stderr)
  [pscustomobject]@{ process=$process; stdoutTask=$stdoutTask; stderrTask=$stderrTask; stdoutStream=$stdout; stderrStream=$stderr; invocation=[ordered]@{
      fileName=$launch.fileName; commandType=$launch.commandType; extension=$launch.extension; resolution=$launch.resolution
      arguments=$arguments; workingDirectory=$WorkingDirectory
    } }
}

function Wait-CandidateTurn {
  [CmdletBinding()]
  param([Parameter(Mandatory)] $CandidateTurn, [Parameter(Mandatory)] [int] $TimeoutSeconds)
  $exited = $CandidateTurn.process.WaitForExit($TimeoutSeconds * 1000)
  if (-not $exited) {
    $CandidateTurn.process.Kill($true)
    $CandidateTurn.process.WaitForExit()
  }
  [System.Threading.Tasks.Task]::WaitAll(@($CandidateTurn.stdoutTask, $CandidateTurn.stderrTask))
  $CandidateTurn.stdoutStream.Dispose(); $CandidateTurn.stderrStream.Dispose()
  [pscustomobject]@{ timedOut=(-not $exited); exitCode=$CandidateTurn.process.ExitCode; processId=$CandidateTurn.process.Id }
}
