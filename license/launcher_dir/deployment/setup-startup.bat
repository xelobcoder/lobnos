@echo off
echo Setting up Lobnos Launcher for Windows Startup...
echo.

REM Get the current directory
set "CURRENT_DIR=%~dp0"
set "LAUNCHER_EXE=%CURRENT_DIR%launcher.exe"

REM Check if launcher.exe exists
if not exist "%LAUNCHER_EXE%" (
    echo ERROR: launcher.exe not found in current directory
    echo Please run this script from the launcher installation folder
    pause
    exit /b 1
)

echo Found launcher: %LAUNCHER_EXE%
echo.

REM Create startup shortcut
set "STARTUP_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
set "SHORTCUT_NAME=Lobnos LIMS Launcher.lnk"

echo Creating startup shortcut...
powershell "$ws = New-Object -ComObject WScript.Shell; $sc = $ws.CreateShortcut('%STARTUP_FOLDER%\%SHORTCUT_NAME%'); $sc.TargetPath = '%LAUNCHER_EXE%'; $sc.WorkingDirectory = '%CURRENT_DIR%'; $sc.Description = 'Lobnos LIMS Application Launcher'; $sc.Save()"

if %ERRORLEVEL% EQU 0 (
    echo SUCCESS: Startup shortcut created!
    echo Location: %STARTUP_FOLDER%\%SHORTCUT_NAME%
) else (
    echo ERROR: Failed to create startup shortcut
)

echo.
echo To verify:
echo 1. Open Run dialog (Win+R)
echo 2. Type: shell:startup
echo 3. Check if "Lobnos LIMS Launcher.lnk" exists
echo.
echo To remove from startup:
echo - Delete the shortcut from the startup folder
echo.
pause