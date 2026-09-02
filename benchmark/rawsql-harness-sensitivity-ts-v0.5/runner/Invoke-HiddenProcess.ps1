function Start-HiddenProcess {
 param(
  [Parameter(Mandatory)][string]$FilePath,
  [Parameter(Mandatory)][string[]]$ArgumentList,
  [string]$WorkingDirectory,
  [string]$RedirectStandardOutput,
  [string]$RedirectStandardError
 )
 $options=@{FilePath=$FilePath;ArgumentList=$ArgumentList;PassThru=$true;WindowStyle='Hidden'}
 if($WorkingDirectory){$options.WorkingDirectory=$WorkingDirectory}
 if($RedirectStandardOutput){$options.RedirectStandardOutput=$RedirectStandardOutput}
 if($RedirectStandardError){$options.RedirectStandardError=$RedirectStandardError}
 Start-Process @options
}
