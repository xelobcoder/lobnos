@echo off
echo Building Lobnos Launcher with security manifest...

REM Clean previous build
if exist launcher.exe del launcher.exe

REM Build with manifest and security flags
go build -ldflags "-H windowsgui -s -w" -o launcher.exe launcher.go

REM Embed manifest if rsrc.exe is available (optional)
REM rsrc.exe -manifest launcher.exe.manifest -o launcher.syso
REM go build -ldflags "-H windowsgui -s -w" -o launcher.exe launcher.go

echo Build complete!
echo.
echo To mark as safe in Windows Defender:
echo 1. Right-click launcher.exe ^> Properties ^> General ^> Unblock
echo 2. Add to Windows Defender exclusions if needed
echo 3. Or submit to Microsoft for analysis at: https://www.microsoft.com/en-us/wdsi/filesubmission
echo.
pause