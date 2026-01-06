#Requires -Version 5.1

param(
    [switch]$Clean,
    [switch]$Verbose
)

Write-Host "Building Lobnos Launcher with security manifest..." -ForegroundColor Green

# Clean previous build
if ($Clean -or (Test-Path "launcher.exe")) {
    Write-Host "Cleaning previous build..." -ForegroundColor Yellow
    Remove-Item "launcher.exe" -Force -ErrorAction SilentlyContinue
}

# Build with manifest and security flags
$buildCmd = "go build -ldflags ""-H windowsgui -s -w"" -o launcher.exe launcher.go"
Write-Host "Executing: $buildCmd" -ForegroundColor Cyan

try {
    Invoke-Expression $buildCmd
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Build successful!" -ForegroundColor Green

        # Get file info
        $fileInfo = Get-Item "launcher.exe"
        Write-Host "Output: $($fileInfo.FullName)" -ForegroundColor Gray
        Write-Host "Size: $([math]::Round($fileInfo.Length / 1MB, 2)) MB" -ForegroundColor Gray

        Write-Host "`nTo resolve Windows security warnings:" -ForegroundColor Yellow
        Write-Host "1. Right-click launcher.exe > Properties > General tab > Check 'Unblock'" -ForegroundColor White
        Write-Host "2. Add to Windows Defender exclusions:" -ForegroundColor White
        Write-Host "   - Open Windows Security > Virus & threat protection > Manage settings" -ForegroundColor White
        Write-Host "   - Under 'Exclusions' > Add or remove exclusions > Add folder" -ForegroundColor White
        Write-Host "3. Submit to Microsoft for analysis: https://www.microsoft.com/en-us/wdsi/filesubmission" -ForegroundColor White
    } else {
        Write-Error "Build failed with exit code $LASTEXITCODE"
        exit $LASTEXITCODE
    }
} catch {
    Write-Error "Build failed: $($_.Exception.Message)"
    exit 1
}