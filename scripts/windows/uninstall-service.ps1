param(
     [string]$ServiceName = "PrimeLabSystemEnterpriseRuntime",
     [string]$NssmPath
)

$ErrorActionPreference = "Stop"

function Test-IsAdministrator {
     $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
     $principal = New-Object Security.Principal.WindowsPrincipal($identity)
     return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

if (-not (Test-IsAdministrator)) {
     $argList = @(
          "-ExecutionPolicy", "Bypass",
          "-File", "`"$PSCommandPath`"",
          "-ServiceName", "`"$ServiceName`""
     )

     try {
          Start-Process -FilePath "powershell.exe" -ArgumentList $argList -Verb RunAs | Out-Null
          Write-Host "Elevation requested. Approve the UAC prompt to continue service removal."
          exit 0
     }
     catch {
          throw "Administrator rights are required to remove a Windows service. Re-run in an elevated PowerShell or approve the UAC prompt."
     }
}

$existing = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
if (-not $existing) {
     Write-Host "Service '$ServiceName' does not exist. Nothing to uninstall."
     exit 0
}

if ($existing.Status -ne "Stopped") {
     Stop-Service -Name $ServiceName -Force
}

if ([string]::IsNullOrWhiteSpace($NssmPath)) {
     $nssmCommand = Get-Command nssm -ErrorAction SilentlyContinue
     if ($nssmCommand) {
          $NssmPath = $nssmCommand.Source
     }
}

if ([string]::IsNullOrWhiteSpace($NssmPath)) {
     $repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..\")).Path
     $localNssm = Join-Path $repoRoot "scripts\windows\tools\nssm.exe"
     if (Test-Path $localNssm) {
          $NssmPath = $localNssm
     }
}

if (-not [string]::IsNullOrWhiteSpace($NssmPath) -and (Test-Path $NssmPath)) {
     & $NssmPath remove $ServiceName confirm | Out-Null
}
else {
     sc.exe delete $ServiceName | Out-Null
}

Write-Host "Service '$ServiceName' removed."
