@echo off
echo Testing Database Connection Implementation
echo =========================================
echo.

echo Option 1: Test with H2 (Local Development)
echo Option 2: Test with Docker MySQL (Production-like)
echo.
set /p choice="Choose option (1 or 2): "

if "%choice%"=="1" goto test_h2
if "%choice%"=="2" goto test_mysql
echo Invalid choice
goto end

:test_h2
echo.
echo Testing with H2 Database...
echo.
java -Dspring.profiles.active=local -cp "target/classes" com.lms.test.DatabaseConnectionSimpleTest
goto end

:test_mysql
echo.
echo Starting MySQL with Docker...
docker-compose up -d mysql
echo Waiting for MySQL...
timeout /t 20 /nobreak
echo.
echo Testing with MySQL...
java -Dspring.profiles.active=test -cp "target/classes" com.lms.ModernLmsApplication
goto end

:end
pause
