@echo off
echo Modern LMS Backend Startup Script
echo =================================
echo.

REM Check if JAR file exists
if exist "target\modern-lms-backend-0.0.1-SNAPSHOT.jar" (
    echo Found JAR file, starting with production database...
    echo.
    echo Starting Modern LMS Backend...
    echo Database: MySQL (Docker)
    echo Profile: default
    echo Port: 8080
    echo Context Path: /api
    echo.
    echo Health Check: http://localhost:8080/api/health
    echo Database Health: http://localhost:8080/api/health/database
    echo H2 Console: http://localhost:8080/api/h2-console (if using local profile)
    echo.
    java -jar target\modern-lms-backend-0.0.1-SNAPSHOT.jar
) else (
    echo JAR file not found. Building application first...
    echo.
    
    REM Try to build with mvnd if available
    where mvnd >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo Building with Maven Daemon...
        mvnd clean package -DskipTests
    ) else (
        REM Try to build with Docker
        echo Building with Docker...
        docker run --rm -v "%cd%":/app -w /app maven:3.9.6-eclipse-temurin-17 mvn clean package -DskipTests
    )
    
    if exist "target\modern-lms-backend-0.0.1-SNAPSHOT.jar" (
        echo.
        echo Build successful! Starting application...
        java -jar target\modern-lms-backend-0.0.1-SNAPSHOT.jar
    ) else (
        echo.
        echo ❌ Build failed! Please check the error messages above.
        echo.
        echo Alternative: Start with local H2 database
        echo Run: start-app-local.bat
        echo.
        pause
        exit /b 1
    )
)

pause
