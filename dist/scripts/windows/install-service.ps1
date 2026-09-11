param(
     [string]$ServiceName = "PrimeLabSystemEnterpriseRuntime",
     [string]$DisplayName = "PrimeLabSystemEnterprise Runtime",
     [string]$Description = "PrimeLabSystemEnterprise Runtime",
     [switch]$BuildBeforeInstall,
     [switch]$StartNow,
     [string]$NodePath,
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
          "-ServiceName", "`"$ServiceName`"",
          "-DisplayName", "`"$DisplayName`"",
          "-Description", "`"$Description`""
     )

     if ($BuildBeforeInstall) { $argList += "-BuildBeforeInstall" }
     if ($StartNow) { $argList += "-StartNow" }
     if (-not [string]::IsNullOrWhiteSpace($NodePath)) {
          $argList += @("-NodePath", "`"$NodePath`"")
     }

     try {
          Start-Process -FilePath "powershell.exe" -ArgumentList $argList -Verb RunAs | Out-Null
          Write-Host "Elevation requested. Approve the UAC prompt to continue service installation."
          exit 0
     }
     catch {
          throw "Administrator rights are required to create a Windows service. Re-run in an elevated PowerShell or approve the UAC prompt."
     }
}

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..\")).Path
$appEntry = Join-Path $repoRoot "server.js"
$nextBuildMarker = Join-Path $repoRoot ".next\BUILD_ID"


if ($BuildBeforeInstall) {
     Write-Host "Building Next.js..."
     Push-Location $repoRoot
     try {
          npm run build | Out-Host
     }
     finally {
          Pop-Location
     }

     if (-not (Test-Path $nextBuildMarker)) {
          throw "Build completed but Next.js build output was not found at '$nextBuildMarker'."
     }
}

if (-not (Test-Path $appEntry)) {
     throw "Entry file not found at '$appEntry'."
}

if (-not (Test-Path $nextBuildMarker)) {
     throw "Next.js build output not found at '$nextBuildMarker'. Run npm run build first, or use -BuildBeforeInstall."
}

if ([string]::IsNullOrWhiteSpace($NodePath)) {
     $nodeCommand = Get-Command node -ErrorAction SilentlyContinue
     if (-not $nodeCommand) {
          throw "Node.js was not found in PATH. Install Node.js or provide -NodePath."
     }
     $NodePath = $nodeCommand.Source
}

if ([string]::IsNullOrWhiteSpace($NssmPath)) {
     $nssmCommand = Get-Command nssm -ErrorAction SilentlyContinue
     if ($nssmCommand) {
          $NssmPath = $nssmCommand.Source
     }
}

if ([string]::IsNullOrWhiteSpace($NssmPath)) {
     $localNssm = Join-Path $repoRoot "scripts\windows\tools\nssm.exe"
     if (Test-Path $localNssm) {
          $NssmPath = $localNssm
     }
}

if ([string]::IsNullOrWhiteSpace($NssmPath) -or -not (Test-Path $NssmPath)) {
     throw "NSSM was not found. Install NSSM (nssm.exe) and add it to PATH, then re-run."
}

$existing = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
if ($existing) {
     throw "Service '$ServiceName' already exists. Use scripts/windows/uninstall-service.ps1 first if you want to recreate it."
}

$logsDir = Join-Path $repoRoot "logs"
if (-not (Test-Path $logsDir)) {
     New-Item -ItemType Directory -Path $logsDir | Out-Null
}

$serviceStdOut = Join-Path $logsDir "lobnos-service-out.log"
$serviceStdErr = Join-Path $logsDir "lobnos-service-error.log"

& $NssmPath install $ServiceName $NodePath "--env-file=.env" ".\\server.js" | Out-Null
& $NssmPath set $ServiceName AppDirectory $repoRoot | Out-Null
& $NssmPath set $ServiceName DisplayName $DisplayName | Out-Null
& $NssmPath set $ServiceName Description $Description | Out-Null
& $NssmPath set $ServiceName Start SERVICE_AUTO_START | Out-Null
& $NssmPath set $ServiceName AppEnvironmentExtra "NODE_ENV=production" | Out-Null
& $NssmPath set $ServiceName AppStdout $serviceStdOut | Out-Null
& $NssmPath set $ServiceName AppStderr $serviceStdErr | Out-Null
& $NssmPath set $ServiceName AppRotateFiles 1 | Out-Null
& $NssmPath set $ServiceName AppRotateOnline 1 | Out-Null

sc.exe failure $ServiceName reset= 86400 actions= restart/5000/restart/5000/restart/5000 | Out-Null

if ($StartNow) {
     Start-Service -Name $ServiceName
     Write-Host "Service '$ServiceName' installed and started."
}
else {
     Write-Host "Service '$ServiceName' installed. Start with: Start-Service -Name $ServiceName"
}

Write-Host "Done."
