@echo off
echo ========================================
echo    LMS System Startup Script
echo ========================================
echo.

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

:: Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm is not installed or not in PATH
    pause
    exit /b 1
)

echo Node.js and npm are installed ✓
echo.

:: Install frontend dependencies
echo Installing frontend dependencies...
if not exist "node_modules" (
    echo Running npm install for frontend...
    npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install frontend dependencies
        pause
        exit /b 1
    )
) else (
    echo Frontend dependencies already installed ✓
)

:: Install backend dependencies
echo.
echo Installing backend dependencies...
cd backend
if not exist "node_modules" (
    echo Running npm install for backend...
    npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install backend dependencies
        pause
        exit /b 1
    )
) else (
    echo Backend dependencies already installed ✓
)

:: Check for .env file
if not exist ".env" (
    echo.
    echo WARNING: Backend .env file not found
    echo Copying .env.example to .env...
    copy .env.example .env
    echo.
    echo IMPORTANT: Please edit backend/.env file with your database and other settings
    echo Press any key to continue after editing .env file...
    pause
)

:: Generate Prisma client
echo.
echo Generating Prisma client...
npx prisma generate
if %errorlevel% neq 0 (
    echo ERROR: Failed to generate Prisma client
    pause
    exit /b 1
)

:: Run database migrations (optional)
echo.
echo Do you want to run database migrations? (y/n)
set /p migrate="Enter choice: "
if /i "%migrate%"=="y" (
    echo Running database migrations...
    npx prisma migrate dev
    if %errorlevel% neq 0 (
        echo WARNING: Database migration failed
        echo Make sure your database is running and configured correctly
    )
)

cd ..

:: Create logs directory for backend
if not exist "backend\logs" (
    mkdir backend\logs
)

echo.
echo ========================================
echo    Starting LMS System
echo ========================================
echo.
echo Starting backend server on port 5000...
echo Starting frontend server on port 3000...
echo.
echo Backend will be available at: http://localhost:5000
echo Frontend will be available at: http://localhost:3000
echo.
echo Press Ctrl+C to stop both servers
echo.

:: Start both servers concurrently
start "LMS Backend" cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak >nul
start "LMS Frontend" cmd /k "npm start"

echo.
echo Both servers are starting...
echo Check the opened terminal windows for server status
echo.
echo If you encounter any issues:
echo 1. Check that your database is running
echo 2. Verify your .env configuration
echo 3. Ensure ports 3000 and 5000 are available
echo.
pause
