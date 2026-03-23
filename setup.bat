@echo off
REM Windows Setup Script for GetHired Platform
REM This script sets up the environment for multi-machine deployment

setlocal enabledelayedexpansion

echo.
echo ==========================================
echo GetHired Platform - Setup Script
echo ==========================================
echo.

REM Get option
if "%1"=="" (
    echo Usage: setup.bat [backend^|frontend^|bothlocal^|test]
    echo.
    echo Options:
    echo   backend     - Start backend server
    echo   frontend    - Start frontend dev server (requires .env.local)
    echo   bothlocal   - Start both backend and frontend (same machine)
    echo   test        - Test backend connectivity
    echo.
    echo Example for different machines:
    echo   Machine 1 (Backend):  setup.bat backend
    echo   Machine 2 (Frontend): setup.bat frontend
    echo.
    exit /b 1
)

if "%1"=="backend" (
    echo Starting Backend Server...
    echo.
    cd backend
    echo Backend running on http://0.0.0.0:8000
    echo Share this IP with frontend machines: 
    for /f "tokens=4 delims= " %%a in ('route print ^| find " 0.0.0.0"') do echo   %%a
    echo.
    python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
    exit /b 0
)

if "%1"=="frontend" (
    echo Starting Frontend Dev Server...
    echo.
    if exist "frontend\.env.local" (
        echo Using existing .env.local
        for /f "tokens=2 delims==" %%a in ('type frontend\.env.local ^| find "VITE_API_BASE_URL"') do (
            echo API Backend: %%a
        )
    ) else (
        echo .env.local not found!
        echo Create frontend\.env.local with:
        echo   VITE_API_BASE_URL=http://[backend-ip]:8000
        echo.
        echo For example, if backend is at 192.168.1.100:
        echo   VITE_API_BASE_URL=http://192.168.1.100:8000
        exit /b 1
    )
    echo.
    cd frontend
    npm run dev
    exit /b 0
)

if "%1"=="bothlocal" (
    echo Starting Backend and Frontend (Same Machine)...
    echo.
    echo Step 1: Creating frontend\.env.local for localhost...
    if not exist "frontend\.env.local" (
        copy frontend\.env.example frontend\.env.local
    )
    echo.
    echo Step 2: Starting backend in background...
    start "GetHired Backend" cmd /k cd backend ^& python -m univicorn main:app --reload --host 127.0.0.1 --port 8000
    timeout /t 3 /nobreak
    echo.
    echo Step 3: Starting frontend...
    cd frontend
    echo Backend: http://127.0.0.1:8000
    echo Frontend: http://localhost:5173
    npm run dev
    exit /b 0
)

if "%1"=="test" (
    echo Testing Backend Connectivity...
    echo.
    curl http://127.0.0.1:8000/health
    if errorlevel 1 (
        echo Backend not running on localhost!
        echo Run: setup.bat backend
    ) else (
        echo Backend is running!
    )
    exit /b 0
)

echo Unknown option: %1
exit /b 1
