param(
    [ValidateSet("build", "dev")]
    [string]$Action = "build"
)

$ErrorActionPreference = "Stop"

$vswhere = Join-Path ${env:ProgramFiles(x86)} "Microsoft Visual Studio\Installer\vswhere.exe"
if (-not (Test-Path -LiteralPath $vswhere)) {
    throw "Visual Studio Installer was not found. Install Visual Studio Build Tools with the C++ build tools workload."
}

$installationPath = & $vswhere `
    -latest `
    -products * `
    -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64 `
    -property installationPath

if (-not $installationPath) {
    throw "Microsoft C++ Build Tools were not found. Add the Desktop development with C++ workload in Visual Studio Installer."
}

$vsDevCmd = Join-Path $installationPath "Common7\Tools\VsDevCmd.bat"
if (-not (Test-Path -LiteralPath $vsDevCmd)) {
    throw "Visual Studio developer command script was not found at $vsDevCmd."
}

$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$environmentOutput = & $env:ComSpec /d /s /c ('call "{0}" -arch=x64 -host_arch=x64 >nul && set' -f $vsDevCmd)
if ($LASTEXITCODE -ne 0) {
    throw "Visual Studio C++ environment setup failed. Finish installing the C++ build tools and Windows SDK, then retry."
}

foreach ($line in $environmentOutput) {
    if ($line -match '^([^=]+)=(.*)$') {
        [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
    }
}

if (-not $env:VCToolsInstallDir) {
    throw "Visual Studio did not configure the C++ toolchain. Finish installing the Desktop development with C++ workload."
}

$linker = Join-Path $env:VCToolsInstallDir "bin\Hostx64\x64\link.exe"
if (-not (Test-Path -LiteralPath $linker)) {
    throw "Microsoft's x64 linker is missing at $linker. Finish or repair the C++ build tools installation."
}

if (-not $env:WindowsSdkDir -or -not $env:WindowsSDKVersion) {
    throw "The Windows SDK was not configured. Install a Windows 10 or Windows 11 SDK using Visual Studio Installer."
}

$sdkLibrary = Join-Path $env:WindowsSdkDir ("Lib\{0}\um\x64\kernel32.lib" -f $env:WindowsSDKVersion.TrimEnd('\'))
if (-not (Test-Path -LiteralPath $sdkLibrary)) {
    throw "The Windows SDK libraries are missing. Finish or repair the Windows SDK installation."
}

$env:CARGO_TARGET_X86_64_PC_WINDOWS_MSVC_LINKER = $linker
Write-Host "Using Microsoft linker: $linker"

Push-Location $projectRoot
try {
    if ($Action -eq "dev") {
        & pnpm exec tauri dev
    } else {
        & pnpm exec tauri build --bundles nsis
    }
    $buildExitCode = $LASTEXITCODE
} finally {
    Pop-Location
}
exit $buildExitCode
