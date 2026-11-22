param(
 [string]$FrontendDirectory,
 [string]$BackendDirectory,
 [string]$FrontendService='PrimeLabSystemEnterpriseRuntime',
 [string]$BackendService='PrimeLabSystemRuntime',
 [string]$MySqlService='MySQL80',
 [switch]$DetectOnly
)
$ErrorActionPreference='Stop'
function Find-DeploymentFolder([string]$explicit,[string]$service,[string]$marker,[string]$sibling) {
 if($explicit){return (Resolve-Path -LiteralPath $explicit).Path}
 $parameters=Get-ItemProperty -LiteralPath ("HKLM:\SYSTEM\CurrentControlSet\Services\"+$service+'\Parameters') -ErrorAction SilentlyContinue
 $base=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../..'))
 $alias=if($sibling -eq 'frontend'){'FK'}else{'BK'}
 $candidates=@($parameters.AppDirectory,$base,(Join-Path $base $sibling),(Join-Path $base ('../'+$sibling)),(Join-Path $base ('runtime/'+$sibling)),(Join-Path $base ('../../runtime/'+$sibling)),(Join-Path 'C:\PLS-TEST' $alias),(Join-Path (Get-Location) $alias))
 $matches=@($candidates | Where-Object {$_ -and (Test-Path -LiteralPath (Join-Path $_ $marker))} | ForEach-Object {[IO.Path]::GetFullPath($_)} | Select-Object -Unique)
 if($parameters.AppDirectory -and (Test-Path -LiteralPath (Join-Path $parameters.AppDirectory $marker))){return [IO.Path]::GetFullPath($parameters.AppDirectory)}
 if($matches.Count -ne 1){
  if($DetectOnly){throw "Cannot uniquely detect deployment for $service. Supply the deployed folder path explicitly."}
  if($matches.Count -gt 1){Write-Host ('Possible '+$sibling+' folders: '+($matches -join ', '))}
  $selected=Read-Host ("Enter the full deployed $sibling folder path")
  if(-not $selected -or -not (Test-Path -LiteralPath (Join-Path $selected $marker))){throw "The selected $sibling folder does not contain $marker. No system settings were changed."}
  return (Resolve-Path -LiteralPath $selected).Path
 }
 return $matches[0]
}
$FrontendDirectory=Find-DeploymentFolder $FrontendDirectory $FrontendService '.next/BUILD_ID' 'frontend'
$BackendDirectory=Find-DeploymentFolder $BackendDirectory $BackendService 'dist/src/start.js' 'backend'
if($DetectOnly){Write-Output "Frontend: $FrontendDirectory";Write-Output "Backend: $BackendDirectory";return}
# Refuse source folders before requesting elevation or changing this machine.
foreach($folder in @($FrontendDirectory,$BackendDirectory)){if(Test-Path -LiteralPath (Join-Path $folder '.git')){throw 'Refusing to change permissions on a source checkout. Use deployed runtime folders.'}}
$principal=[Security.Principal.WindowsPrincipal]::new([Security.Principal.WindowsIdentity]::GetCurrent())
if(-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)){
 $arguments=@('-NoProfile','-ExecutionPolicy','Bypass','-File',('"'+$PSCommandPath+'"'),'-FrontendDirectory',('"'+$FrontendDirectory+'"'),'-BackendDirectory',('"'+$BackendDirectory+'"'),'-FrontendService',('"'+$FrontendService+'"'),'-BackendService',('"'+$BackendService+'"'),'-MySqlService',('"'+$MySqlService+'"'))
 $elevated=Start-Process -FilePath powershell.exe -Verb RunAs -WindowStyle Hidden -ArgumentList $arguments -Wait -PassThru
 if($elevated.ExitCode -ne 0){throw 'Elevated dedicated-server configuration failed.'}
 return
}
$front=(Resolve-Path -LiteralPath $FrontendDirectory).Path
$back=(Resolve-Path -LiteralPath $BackendDirectory).Path
if($front -eq $back -or $front.StartsWith($back+'\') -or $back.StartsWith($front+'\')){throw 'Use separate frontend and backend deployment folders.'}
foreach($folder in @($front,$back)){
 if(Test-Path -LiteralPath (Join-Path $folder '.git')){throw 'Refusing to change permissions on a source checkout. Use deployed runtime folders.'}
}
if(-not (Test-Path -LiteralPath (Join-Path $front '.next/BUILD_ID')) -or -not (Test-Path -LiteralPath (Join-Path $back 'dist/src/start.js'))){throw 'Compiled deployment output is missing.'}
foreach($name in @($FrontendService,$BackendService,$MySqlService)){Get-Service -Name $name -ErrorAction Stop | Out-Null}
# Capture current settings before changing service identities or folder permissions.
$record=Join-Path $back ('service-security-before-'+(Get-Date -Format yyyyMMddHHmmss)+'.json')
@{services=@(Get-CimInstance Win32_Service | Where-Object Name -in @($FrontendService,$BackendService,$MySqlService) | Select-Object Name,StartName,StartMode);frontendSddl=(Get-Acl -LiteralPath $front).Sddl;backendSddl=(Get-Acl -LiteralPath $back).Sddl} | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $record
foreach($entry in @(@{name=$BackendService;folder=$back},@{name=$FrontendService;folder=$front})){
 $identity='NT SERVICE\'+$entry.name
 Stop-Service -Name $entry.name -Force -ErrorAction Stop
 & sc.exe config $entry.name obj= $identity start= auto | Out-Null
 if($LASTEXITCODE -ne 0){throw "Service identity configuration failed: $($entry.name)"}
 & sc.exe sidtype $entry.name unrestricted | Out-Null
 if($LASTEXITCODE -ne 0){throw 'Service SID configuration failed'}
 & icacls.exe $entry.folder /inheritance:r /grant:r '*S-1-5-18:(OI)(CI)F' '*S-1-5-32-544:(OI)(CI)F' "${identity}:(OI)(CI)RX" | Out-Null
 if($LASTEXITCODE -ne 0){throw 'Runtime permission configuration failed'}
 foreach($relative in @('logs','public','backups')){
  $writable=Join-Path $entry.folder $relative
  if(-not (Test-Path -LiteralPath $writable)){New-Item -ItemType Directory -Path $writable | Out-Null}
  & icacls.exe $writable /grant:r "${identity}:(OI)(CI)M" | Out-Null
  if($LASTEXITCODE -ne 0){throw 'Writable-directory permissions failed'}
 }
}
Set-Service -Name $MySqlService -StartupType Automatic
$login='HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon'
Set-ItemProperty -Path $login -Name AutoAdminLogon -Value '0'
Remove-ItemProperty -Path $login -Name DefaultPassword -ErrorAction SilentlyContinue
$policy='HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System'
New-ItemProperty -Path $policy -Name InactivityTimeoutSecs -PropertyType DWord -Value 300 -Force | Out-Null
Start-Service -Name $MySqlService
Start-Service -Name $BackendService
Start-Service -Name $FrontendService
Get-Service -Name $MySqlService,$BackendService,$FrontendService | Select-Object Name,Status,StartType
Write-Host 'Automatic login disabled. Services run before interactive login. Use a password-protected Windows administrator account for maintenance.'
Write-Host 'Restart the server and verify login from a staff computer before leaving the site.'
