@echo off
title FinSight - All Services
color 0A

echo.
echo  ███████╗██╗███╗   ██╗███████╗██╗ ██████╗ ██╗  ██╗████████╗
echo  ██╔════╝██║████╗  ██║██╔════╝██║██╔════╝ ██║  ██║╚══██╔══╝
echo  █████╗  ██║██╔██╗ ██║███████╗██║██║  ███╗███████║   ██║
echo  ██╔══╝  ██║██║╚██╗██║╚════██║██║██║   ██║██╔══██║   ██║
echo  ██║     ██║██║ ╚████║███████║██║╚██████╔╝██║  ██║   ██║
echo  ╚═╝     ╚═╝╚═╝  ╚═══╝╚══════╝╚═╝ ╚═════╝ ╚═╝  ╚═╝   ╚═╝
echo.
echo  Personal Finance ^& Expense Analytics Platform
echo  ═══════════════════════════════════════════════
echo.

echo [1/3] Starting Backend API (port 4000)...
start "FinSight Backend" cmd /k "cd /d "%~dp0backend" && node server.js"
timeout /t 2 /nobreak >nul

echo [2/3] Starting Analytics Service (port 8000)...
start "FinSight Analytics" cmd /k "cd /d "%~dp0analytics" && python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"
timeout /t 3 /nobreak >nul

echo [3/3] Starting Frontend (port 5173)...
start "FinSight Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"
timeout /t 4 /nobreak >nul

echo.
echo  ✅ All services started!
echo.
echo  🌐 Frontend:   http://localhost:5173
echo  ⚙️  Backend:    http://localhost:4000
echo  🤖 Analytics:  http://localhost:8000
echo  📚 API Docs:   http://localhost:4000/api-docs
echo.
echo  Demo Accounts:
echo    test@finsight.com   / Test@123456
echo    admin@finsight.com  / Admin@123456
echo.
echo Opening app in browser...
timeout /t 2 /nobreak >nul
start http://localhost:5173

echo.
echo Press any key to close this launcher...
pause >nul
