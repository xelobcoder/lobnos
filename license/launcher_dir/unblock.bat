@echo off
echo Unblocking Lobnos Launcher executable...
echo.

REM Check if launcher.exe exists
if not exist "launcher.exe" (
    echo ERROR: launcher.exe not found in current directory
    echo Please run this script from the launcher_dir folder
    pause
    exit /b 1
)

echo Current file properties:
powershell "Get-Item launcher.exe | Select-Object Name, Length, LastWriteTime, @{Name='Blocked';Expression={$_.Attributes -match 'ReparsePoint'}}"

echo.
echo Attempting to unblock the file...
powershell "Unblock-File -Path launcher.exe"

echo.
echo File unblocked successfully!
echo.
echo If you still get security warnings, try:
echo 1. Add this folder to Windows Defender exclusions
echo 2. Submit the file to Microsoft for analysis
echo.
pause