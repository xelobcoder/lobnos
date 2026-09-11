param(
     [ValidateSet("start", "stop", "restart", "status")]
     [string]$Action,
     [string]$ServiceName = "PrimeLabSystemEnterpriseRuntime"
)

$ErrorActionPreference = "Stop"

function Test-IsAdministrator {
     $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
     $principal = New-Object Security.Principal.WindowsPrincipal($identity)
     return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Ensure-ElevationIfNeeded {
     param([string]$RequestedAction, [string]$TargetService)

     if ($RequestedAction -eq "status") {
          return
     }

     if (Test-IsAdministrator) {
          return
     }

     $argList = @(
          "-ExecutionPolicy", "Bypass",
          "-File", "`"$PSCommandPath`"",
          "-Action", $RequestedAction,
          "-ServiceName", "`"$TargetService`""
     )

     try {
          Start-Process -FilePath "powershell.exe" -ArgumentList $argList -Verb RunAs | Out-Null
          Write-Host "Elevation requested. Approve the UAC prompt to continue service operation."
          exit 0
     }
     catch {
          throw "Administrator rights are required for '$RequestedAction'. Re-run in an elevated PowerShell or approve the UAC prompt."
     }
}

$service = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
if (-not $service) {
     throw "Service '$ServiceName' does not exist. Install it first with npm run service:install:win"
}

Ensure-ElevationIfNeeded -RequestedAction $Action -TargetService $ServiceName

switch ($Action) {
     "start" {
          if ($service.Status -eq "Running") {
               Write-Host "Service '$ServiceName' is already running."
          }
          else {
               Start-Service -Name $ServiceName
               Write-Host "Service '$ServiceName' started."
          }
     }
     "stop" {
          if ($service.Status -eq "Stopped") {
               Write-Host "Service '$ServiceName' is already stopped."
          }
          else {
               Stop-Service -Name $ServiceName -Force
               Write-Host "Service '$ServiceName' stopped."
          }
     }
     "restart" {
          Restart-Service -Name $ServiceName -Force
          Write-Host "Service '$ServiceName' restarted."
     }
     "status" {
          Get-Service -Name $ServiceName | Format-Table -Auto Name, Status, StartType
     }
}
