@echo off
echo Modern LMS - Database Connection Test
echo =====================================
echo.

REM Check if Docker is running
echo Step 1: Checking Docker status...
docker ps >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Docker is not running!
    echo Please start Docker Desktop and try again.
    echo.
    pause
    exit /b 1
)
echo ✅ Docker is running

echo.
echo Step 2: Starting database services...
docker-compose up -d mysql rabbitmq redis

echo.
echo Step 3: Waiting for MySQL to be ready...
timeout /t 30 /nobreak >nul

echo.
echo Step 4: Testing MySQL connection...
docker exec lms-mysql mysql -u lms_user -plms_password -e "SELECT 'Database connection successful!' as status;"

if %ERRORLEVEL% EQU 0 (
    echo ✅ MySQL connection successful!
) else (
    echo ❌ MySQL connection failed!
    echo Checking MySQL logs...
    docker logs lms-mysql --tail 20
)

echo.
echo Step 5: Testing RabbitMQ connection...
curl -s -u lms_user:lms_password http://localhost:15672/api/overview >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ RabbitMQ connection successful!
) else (
    echo ❌ RabbitMQ connection failed!
    echo Checking RabbitMQ logs...
    docker logs lms-rabbitmq --tail 20
)

echo.
echo Step 6: Testing Redis connection...
docker exec lms-redis redis-cli ping
if %ERRORLEVEL% EQU 0 (
    echo ✅ Redis connection successful!
) else (
    echo ❌ Redis connection failed!
)

echo.
echo Step 7: Checking database tables...
echo Listing tables in modern_lms database:
docker exec lms-mysql mysql -u lms_user -plms_password modern_lms -e "SHOW TABLES;"

echo.
echo Step 8: Database connection test completed!
echo.
echo Services Status:
docker-compose ps

echo.
echo You can now:
echo 1. Start the Spring Boot application
echo 2. Access H2 Console at: http://localhost:8080/api/h2-console (if using local profile)
echo 3. Access RabbitMQ Management at: http://localhost:15672 (lms_user/lms_password)
echo 4. Test API endpoints at: http://localhost:8080/api/health
echo.
pause
