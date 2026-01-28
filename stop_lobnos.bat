@echo off
title Stop Lobnos
color 0C
cls
echo.
echo =============================================
echo      S T O P P I N G   L O B N O S
echo =============================================
echo.
echo Stopping launcher/monitor...
taskkill /F /FI "WINDOWTITLE eq Lobnos Auto-Launcher & Monitor" >nul 2>&1
echo.
echo Stopping apps...
taskkill /F /FI "WINDOWTITLE eq BACKEND*" >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq FRONTEND*" >nul 2>&1
echo.
echo Killing leftover node processes...
taskkill /F /IM node.exe >nul 2>&1
echo.
echo =============================================
echo        S Y S T E M   S T O P P E D
echo =============================================
timeout /t 4 >nul
