$ErrorActionPreference = "Stop"

function Test-CommandAvailable {
     param([string]$Name)
     return [bool](Get-Command $Name -ErrorAction SilentlyContinue)
}

function Refresh-PathFromEnvironment {
     $machine = [Environment]::GetEnvironmentVariable("Path", "Machine")
     $user = [Environment]::GetEnvironmentVariable("Path", "User")
     $env:Path = "$machine;$user"
}

function Confirm-NssmAvailable {
     $nssm = Get-Command nssm -ErrorAction SilentlyContinue
     if ($nssm) {
          Write-Host "NSSM is available at: $($nssm.Source)"
          return $true
     }

     return $false
}

if (Confirm-NssmAvailable) {
     exit 0
}

if (Test-CommandAvailable -Name "winget") {
     Write-Host "Installing NSSM using winget..."
     winget install --id NSSM.NSSM -e --accept-package-agreements --accept-source-agreements
     Refresh-PathFromEnvironment
     if (Confirm-NssmAvailable) { exit 0 }
}

if (Test-CommandAvailable -Name "choco") {
     Write-Host "Installing NSSM using Chocolatey..."
     choco install nssm -y
     Refresh-PathFromEnvironment
     if (Confirm-NssmAvailable) { exit 0 }
}

if (Test-CommandAvailable -Name "scoop") {
     Write-Host "Installing NSSM using Scoop..."
     scoop install nssm
     Refresh-PathFromEnvironment
     if (Confirm-NssmAvailable) { exit 0 }
}

Write-Host "Package managers were not available or NSSM was still not found. Falling back to direct download..."

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = (Resolve-Path (Join-Path $scriptRoot "..\..")).Path
$toolsDir = Join-Path $repoRoot "scripts\windows\tools"
if (-not (Test-Path $toolsDir)) {
     New-Item -ItemType Directory -Path $toolsDir | Out-Null
}

$tempZip = Join-Path $env:TEMP "nssm-download.zip"
$tempExtract = Join-Path $env:TEMP "nssm-extract"

if (Test-Path $tempExtract) {
     Remove-Item -Path $tempExtract -Recurse -Force
}

$downloadUrls = @(
     "https://nssm.cc/release/nssm-2.24.zip",
     "https://nssm.cc/ci/nssm-2.24-103-gdee49fc.zip"
)

$downloaded = $false
foreach ($url in $downloadUrls) {
     try {
          Write-Host "Attempting download: $url"
          Invoke-WebRequest -Uri $url -OutFile $tempZip -UseBasicParsing
          $downloaded = $true
          break
     }
     catch {
          Write-Host "Download failed from $url"
     }
}

if (-not $downloaded) {
     throw "Could not download NSSM. Download nssm.exe manually and place it in scripts/windows/tools/nssm.exe"
}

Expand-Archive -Path $tempZip -DestinationPath $tempExtract -Force

$candidates = Get-ChildItem -Path $tempExtract -Filter "nssm.exe" -File -Recurse
$candidate = $candidates | Where-Object { $_.FullName -match "\\win64\\" } | Select-Object -First 1
if (-not $candidate) {
     $candidate = $candidates | Where-Object { $_.FullName -match "\\win32\\" } | Select-Object -First 1
}
if (-not $candidate) {
     $candidate = $candidates | Select-Object -First 1
}

if (-not $candidate -or -not (Test-Path $candidate.FullName)) {
     throw "Downloaded NSSM archive but nssm.exe was not found."
}

$localNssm = Join-Path $toolsDir "nssm.exe"
Copy-Item -Path $candidate.FullName -Destination $localNssm -Force

Write-Host "NSSM downloaded to: $localNssm"
Write-Host "Service installer will auto-detect this local copy."
