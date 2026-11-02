@echo off
cd /d "%~dp0"
title IRD Forced Registration Unit (FRU) Master System - Department of Inland Revenue Sri Lanka
echo =========================================================================
echo    DEPARTMENT OF INLAND REVENUE - SRI LANKA
echo    FORCED REGISTRATION UNIT (FRU) MASTER SYSTEM
echo    Powered by Novix Solutions
echo =========================================================================
echo.
echo Starting local secure server...
echo 100%% Confidential ^& Offline Secure.
echo.
echo Launching browser at http://localhost:5173/ ...
echo.

call npm run dev -- --open

pause
