@echo off
echo ========================================
echo   PackSmart AI - Quick Start
echo ========================================
echo.

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found. Please install Python 3.11+
    pause
    exit /b 1
)

REM Check Node
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found. Please install Node.js 18+
    pause
    exit /b 1
)

echo [1/5] Setting up Backend...
cd backend
if not exist ".env" copy .env.example .env
if not exist "venv" (
    python -m venv venv
)
call venv\Scripts\activate.bat
pip install -r requirements.txt -q

echo [2/5] Training ML models...
python -m ml.train 2>nul || echo    (ML training skipped - will use rule engine only)

echo [3/5] Setting up Frontend...
cd ..\frontend
if not exist "node_modules" (
    call npm install
)

echo [4/5] Starting Backend (port 8000)...
cd ..\backend
call venv\Scripts\activate.bat
start "PackSmart Backend" cmd /c "uvicorn app.main:app --reload --port 8000"

echo [5/5] Starting Frontend (port 3000)...
cd ..\frontend
start "PackSmart Frontend" cmd /c "npm run dev"

echo.
echo ========================================
echo   PackSmart AI is running!
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:8000
echo   API Docs: http://localhost:8000/docs
echo ========================================
echo.
pause
