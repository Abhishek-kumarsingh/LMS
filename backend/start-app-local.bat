@echo off
echo Modern LMS Backend - Local Development Mode
echo ==========================================
echo.
echo This will start the application with:
echo - H2 In-Memory Database (no MySQL required)
echo - Disabled external services (RabbitMQ, Mail)
echo - Debug logging enabled
echo.
echo H2 Console will be available at: http://localhost:8080/api/h2-console
echo Connection details:
echo   JDBC URL: jdbc:h2:mem:lmsdb
echo   Username: sa
echo   Password: (empty)
echo.
echo Health Check: http://localhost:8080/api/health
echo Database Health: http://localhost:8080/api/health/database
echo.

REM Check if JAR file exists
if exist "target\modern-lms-backend-0.0.1-SNAPSHOT.jar" (
    echo Starting with JAR file...
    java -Dspring.profiles.active=local -jar target\modern-lms-backend-0.0.1-SNAPSHOT.jar
) else (
    echo JAR file not found. Trying to run from compiled classes...
    
    REM Check if we have compiled classes
    if exist "target\classes\com\lms\ModernLmsApplication.class" (
        echo Starting from compiled classes...
        
        REM Build classpath with all dependencies
        set CLASSPATH=target\classes
        for %%i in (target\dependency\*.jar) do call :addcp %%i
        
        java -Dspring.profiles.active=local -cp "%CLASSPATH%" com.lms.ModernLmsApplication
    ) else (
        echo.
        echo ❌ No compiled classes found!
        echo Please build the project first:
        echo   1. Run setup-mvnd.bat to setup Maven Daemon
        echo   2. Run: mvnd clean compile
        echo   3. Or run: build-with-docker.bat
        echo.
        pause
        exit /b 1
    )
)

pause
goto :eof

:addcp
set CLASSPATH=%CLASSPATH%;%1
goto :eof
