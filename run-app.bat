@echo off
REM ====== START XAMPP MYSQL (SERVER) USING XAMPP CONTROL ======
REM Start XAMPP using xampp_start.exe (will open the XAMPP control panel)
start "XAMPP" "C:\xampp\xampp_start.exe"
REM Wait a few seconds to ensure XAMPP is running
timeout /t 5 /nobreak >nul

REM ====== DEFINE APPLICATION PATHS ======
set "APP_PATH1=C:\Programming\PLS-DIFFERENT-VERSIONS\LobnosProfessionalVersion\lobnos"
set "APP_PATH2=C:\Programming\PLS-DIFFERENT-VERSIONS\LobnosProfessionalVersion\lobnos-server"

REM ====== DEFINE PORTS TO KILL ======
set "PORT1=3000"
set "PORT2=5000"
set "PORT3=4000"

REM Kill processes on those ports
for %%P in (%PORT1% %PORT2% %PORT3%) do (
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr :%%P') do (
        if not %%a==0 (
            taskkill /F /PID %%a 2>nul
        )
    )
)

REM ====== START APPLICATIONS ======
cd /d "%APP_PATH1%"
start "App1" cmd /c "npm run next >nul 2>&1"

cd /d "%APP_PATH2%"
start "App2" cmd /c "npm run dev >nul 2>&1"
