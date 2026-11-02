@echo off
setlocal
cd /d "%~dp0"
title IRD Sri Lanka - Forced Registration Master Intelligence System (RAMIS Intranet)
color 0B

echo ===============================================================================
echo  DEPARTMENT OF INLAND REVENUE SRI LANKA - FORCED REGISTRATION UNIT (FRU)
echo  RAMIS Intranet Air-Gapped Master Intelligence System Launcher
echo ===============================================================================
echo.
echo  * Status: Initializing Local High-Speed Offline Server...
echo  * Network: RAMIS Intranet / Air-Gapped Mode Active
echo  * External Internet: Not Required (100%% Local & Secure)
echo.
echo  Opening browser automatically in 2 seconds...
echo.
echo  NOTE: Keep this black command window OPEN while using the application.
echo        When you are done, simply close this window.
echo ===============================================================================
echo.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0server.ps1"

echo.
echo Server closed. Press any key to exit.
pause >nul
