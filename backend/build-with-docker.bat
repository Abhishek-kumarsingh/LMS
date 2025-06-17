@echo off
echo Building Modern LMS Backend with Docker...
echo.

REM Build the application using Docker
echo Step 1: Building application with Maven in Docker container...
docker run --rm -v "%cd%":/app -w /app maven:3.9.6-eclipse-temurin-17 mvn clean compile package -DskipTests

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Build successful!
    echo.
    echo Step 2: You can now run the application with:
    echo   java -jar target/modern-lms-backend-0.0.1-SNAPSHOT.jar
    echo.
    echo Or start with Docker Compose:
    echo   docker-compose up
    echo.
) else (
    echo.
    echo ❌ Build failed!
    echo Please check the error messages above.
    echo.
)

pause
