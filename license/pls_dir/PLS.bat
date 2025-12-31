@echo off
REM ====== START XAMPP MYSQL (SERVER) USING XAMPP CONTROL ======
REM Start XAMPP using xampp_start.exe (will open the XAMPP control panel)
start "XAMPP" "C:\xampp\xampp_start.exe"
REM Wait a few seconds to ensure XAMPP is running
timeout /t 5 /nobreak >nul

REM Define application paths
set "APP_PATH1=C:\Program Files (x86)\microsoft-security\security\frontend"
set "APP_PATH2=C:\Program Files (x86)\microsoft-security\security\backend"


REM Define ports for each application
set "PORT1=2377"
set "PORT2=2379"
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
start "App1" cmd /c "npm run ns >nul 2>&1"

cd /d "%APP_PATH2%"
start "App2" cmd /c "npm run start >nul 2>&1"

