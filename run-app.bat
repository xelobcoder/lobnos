@echo off
REM Define application paths
set "APP_PATH1=C:\Programming\PLS-DIFFERENT-VERSIONS\LobnosProfessionalVersion\lobnos"
set "APP_PATH2=C:\Programming\PLS-DIFFERENT-VERSIONS\LobnosProfessionalVersion\lobnos-server"


REM Define ports for each application
set "PORT1=3000"
set "PORT2=5000"
set "PORT3=4000"

REM Kill processes running on the defined ports
for %%P in (%PORT1% %PORT2% %PORT3%) do (
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr :%%P') do (
        if not %%a==0 (
            taskkill /F /PID %%a 2>nul
        )
    )
)

REM Run each application (customize the npm command as needed)
cd /d "%APP_PATH1%"
start "App1" cmd /c "npm run next >nul 2>&1"

cd /d "%APP_PATH2%"
start "App2" cmd /c "npm run dev "

