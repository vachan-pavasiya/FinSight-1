@echo off
title FinSight - Stop All Services
echo Stopping all FinSight services...
taskkill /FI "WINDOWTITLE eq FinSight Backend" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq FinSight Analytics" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq FinSight Frontend" /F >nul 2>&1
taskkill /IM "node.exe" /F >nul 2>&1
taskkill /IM "python.exe" /F >nul 2>&1
echo ✅ All services stopped.
pause
