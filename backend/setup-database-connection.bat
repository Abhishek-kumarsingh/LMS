@echo off
echo ================================================================
echo Modern LMS - Complete Database Connection Setup
echo ================================================================
echo.

REM Check if Docker is available
echo Step 1: Checking Docker availability...
docker --version >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ Docker is available
    
    REM Check if Docker is running
    docker ps >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo ✅ Docker is running
        set DOCKER_AVAILABLE=true
    ) else (
        echo ⚠️  Docker is available but not running
        echo    Please start Docker Desktop and run this script again for full setup
        set DOCKER_AVAILABLE=false
    )
) else (
    echo ⚠️  Docker is not available
    set DOCKER_AVAILABLE=false
)

echo.
echo Step 2: Setting up Maven environment...

REM Check if mvnd is available
if exist "D:\maven-mvnd-1.0.2-windows-amd64\maven-mvnd-1.0.2-windows-amd64\bin\mvnd.cmd" (
    echo ✅ Maven Daemon found
    set MVND_PATH=D:\maven-mvnd-1.0.2-windows-amd64\maven-mvnd-1.0.2-windows-amd64\bin
    set PATH=%MVND_PATH%;%PATH%
    set MAVEN_CMD=mvnd
) else (
    echo ⚠️  Maven Daemon not found, checking for regular Maven...
    mvn --version >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo ✅ Maven found
        set MAVEN_CMD=mvn
    ) else (
        echo ❌ No Maven found
        echo    Will use Docker for building
        set MAVEN_CMD=docker
    )
)

echo.
echo Step 3: Database setup options...
echo.
echo Choose your database setup:
echo   1. Full setup with Docker (MySQL + RabbitMQ + Redis)
echo   2. Local development with H2 database
echo   3. Test database connection only
echo   4. Build and test everything
echo.
set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" goto :docker_setup
if "%choice%"=="2" goto :local_setup
if "%choice%"=="3" goto :test_connection
if "%choice%"=="4" goto :build_and_test
goto :invalid_choice

:docker_setup
echo.
echo ================================================================
echo Setting up with Docker (Production-like environment)
echo ================================================================
if "%DOCKER_AVAILABLE%"=="false" (
    echo ❌ Docker is not available or not running
    echo Please start Docker Desktop and try again
    goto :end
)

echo Starting database services...
docker-compose up -d mysql rabbitmq redis

echo Waiting for services to be ready...
timeout /t 30 /nobreak >nul

echo Testing database connection...
docker exec lms-mysql mysql -u lms_user -plms_password -e "SELECT 'MySQL connection successful!' as status;"

if %ERRORLEVEL% EQU 0 (
    echo ✅ Database setup successful!
    echo.
    echo You can now:
    echo   - Run the application: start-app.bat
    echo   - Access MySQL: docker exec -it lms-mysql mysql -u lms_user -plms_password modern_lms
    echo   - Access RabbitMQ: http://localhost:15672 (lms_user/lms_password)
    echo   - View logs: docker-compose logs -f
) else (
    echo ❌ Database setup failed
    echo Check Docker logs: docker-compose logs mysql
)
goto :end

:local_setup
echo.
echo ================================================================
echo Setting up for Local Development (H2 Database)
echo ================================================================
echo.
echo Building application...
if "%MAVEN_CMD%"=="mvnd" (
    mvnd clean compile
) else if "%MAVEN_CMD%"=="mvn" (
    mvn clean compile
) else (
    echo Building with Docker...
    docker run --rm -v "%cd%":/app -w /app maven:3.9.6-eclipse-temurin-17 mvn clean compile
)

if %ERRORLEVEL% EQU 0 (
    echo ✅ Build successful!
    echo.
    echo Starting application with H2 database...
    echo.
    echo H2 Console will be available at: http://localhost:8080/api/h2-console
    echo   JDBC URL: jdbc:h2:mem:lmsdb
    echo   Username: sa
    echo   Password: (empty)
    echo.
    start-app-local.bat
) else (
    echo ❌ Build failed
)
goto :end

:test_connection
echo.
echo ================================================================
echo Testing Database Connection
echo ================================================================
echo.
if "%DOCKER_AVAILABLE%"=="true" (
    echo Testing with Docker MySQL...
    test-database-connection.bat
) else (
    echo Testing with H2 database...
    echo Building and running tests...
    if "%MAVEN_CMD%"=="mvnd" (
        mvnd test -Dspring.profiles.active=test-h2
    ) else if "%MAVEN_CMD%"=="mvn" (
        mvn test -Dspring.profiles.active=test-h2
    ) else (
        docker run --rm -v "%cd%":/app -w /app maven:3.9.6-eclipse-temurin-17 mvn test -Dspring.profiles.active=test-h2
    )
)
goto :end

:build_and_test
echo.
echo ================================================================
echo Building and Testing Everything
echo ================================================================
echo.
echo Step 1: Building application...
if "%MAVEN_CMD%"=="mvnd" (
    mvnd clean package -DskipTests
) else if "%MAVEN_CMD%"=="mvn" (
    mvn clean package -DskipTests
) else (
    docker run --rm -v "%cd%":/app -w /app maven:3.9.6-eclipse-temurin-17 mvn clean package -DskipTests
)

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Build failed
    goto :end
)

echo ✅ Build successful!
echo.
echo Step 2: Running tests...
if "%DOCKER_AVAILABLE%"=="true" (
    echo Testing with MySQL...
    docker-compose up -d mysql rabbitmq
    timeout /t 20 /nobreak >nul
    if "%MAVEN_CMD%"=="mvnd" (
        mvnd test -Dspring.profiles.active=test
    ) else if "%MAVEN_CMD%"=="mvn" (
        mvn test -Dspring.profiles.active=test
    ) else (
        docker run --rm --network host -v "%cd%":/app -w /app maven:3.9.6-eclipse-temurin-17 mvn test -Dspring.profiles.active=test
    )
) else (
    echo Testing with H2...
    if "%MAVEN_CMD%"=="mvnd" (
        mvnd test -Dspring.profiles.active=test-h2
    ) else if "%MAVEN_CMD%"=="mvn" (
        mvn test -Dspring.profiles.active=test-h2
    ) else (
        docker run --rm -v "%cd%":/app -w /app maven:3.9.6-eclipse-temurin-17 mvn test -Dspring.profiles.active=test-h2
    )
)

if %ERRORLEVEL% EQU 0 (
    echo ✅ All tests passed!
    echo.
    echo Your database connection implementation is working correctly!
    echo You can now start the application with: start-app.bat
) else (
    echo ❌ Some tests failed
    echo Check the test output above for details
)
goto :end

:invalid_choice
echo ❌ Invalid choice. Please run the script again and choose 1-4.
goto :end

:end
echo.
echo ================================================================
echo Setup completed!
echo ================================================================
echo.
echo Next steps:
echo   - For production: Use Docker setup (option 1)
echo   - For development: Use local H2 setup (option 2)
echo   - For CI/CD: Tests will use MySQL in GitHub Actions
echo.
echo Troubleshooting:
echo   - Check logs: docker-compose logs
echo   - Restart services: docker-compose restart
echo   - Clean restart: docker-compose down && docker-compose up -d
echo.
pause
