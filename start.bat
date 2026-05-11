@echo off
REM MedAssist AI - Start Script for Windows

echo.
echo ========================================
echo   🏥 MedAssist AI - Development Server
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js v18+
    pause
    exit /b 1
)

REM Check if .env file exists
if not exist "backend\.env" (
    echo ❌ backend\.env file not found!
    echo Please follow the SETUP.md instructions to configure your environment.
    pause
    exit /b 1
)

echo Starting services...
echo.

REM Start backend in a new terminal
echo 🚀 Starting Backend Server (port 5000)...
start "Backend - MedAssist" cmd /k "cd backend && npm run dev"

REM Wait a bit for backend to start
timeout /t 3 /nobreak

REM Start frontend in a new terminal
echo 🚀 Starting Frontend Dev Server (port 5173)...
start "Frontend - MedAssist" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo ✅ Services started!
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Press Ctrl+C in any terminal to stop.
echo ========================================
