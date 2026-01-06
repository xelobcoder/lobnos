@echo off
echo Creating Lobnos Launcher deployment package...
echo.

set DEPLOY_DIR=deployment
set CLIENT_FILES=launcher.exe launcher.exe.manifest .env README.md unblock.bat setup-startup.bat setup-startup.ps1 DEPLOYMENT.md

REM Create deployment directory
if exist "%DEPLOY_DIR%" rmdir /s /q "%DEPLOY_DIR%"
mkdir "%DEPLOY_DIR%"

echo Copying client files...
for %%f in (%CLIENT_FILES%) do (
    if exist "%%f" (
        copy "%%f" "%DEPLOY_DIR%\" >nul
        echo   ✓ %%f
    ) else (
        echo   ✗ %%f (not found)
    )
)

echo.
echo Creating deployment archive...
powershell "Compress-Archive -Path '%DEPLOY_DIR%\*' -DestinationPath 'lobnos-launcher-deployment.zip' -Force"

echo.
echo Deployment package created successfully!
echo.
echo Files included in deployment:
for %%f in (%CLIENT_FILES%) do (
    if exist "%DEPLOY_DIR%\%%f" echo   • %%f
)

echo.
echo Archive: lobnos-launcher-deployment.zip
echo.
echo Send this ZIP file to the client.
echo.
pause