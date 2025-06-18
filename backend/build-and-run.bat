@echo off
echo Building and Running Modern LMS Backend
echo ========================================
echo.

REM Set Maven Daemon path
set MVND_PATH=D:\maven-mvnd-1.0.2-windows-amd64\maven-mvnd-1.0.2-windows-amd64\bin
set PATH=%MVND_PATH%;%PATH%

REM Set Java Home (try to find it automatically)
for /f "tokens=2*" %%i in ('reg query "HKEY_LOCAL_MACHINE\SOFTWARE\JavaSoft\JDK" /s /v JavaHome 2^>nul ^| find "JavaHome"') do set JAVA_HOME=%%j

REM If not found, try common locations
if not defined JAVA_HOME (
    if exist "C:\Program Files\Java\jdk-17.0.12" set JAVA_HOME=C:\Program Files\Java\jdk-17.0.12
    if exist "C:\Program Files\Java\jdk-17" set JAVA_HOME=C:\Program Files\Java\jdk-17
    if exist "C:\Program Files\Eclipse Adoptium\jdk-17*" for /d %%i in ("C:\Program Files\Eclipse Adoptium\jdk-17*") do set JAVA_HOME=%%i
)

echo Java Home: %JAVA_HOME%
echo Maven Daemon Path: %MVND_PATH%
echo.

REM Try to build with mvnd
echo Step 1: Building with Maven Daemon...
mvnd clean package -DskipTests -q

if %ERRORLEVEL% EQU 0 (
    echo ✅ Build successful!
    echo.
    echo Step 2: Starting application...
    echo.
    echo Application will start with H2 database
    echo H2 Console: http://localhost:8080/api/h2-console
    echo Health Check: http://localhost:8080/api/health
    echo.
    java -Dspring.profiles.active=local -jar target\modern-lms-backend-0.0.1-SNAPSHOT.jar
) else (
    echo ❌ Build failed with Maven Daemon
    echo.
    echo Trying alternative approach...
    echo Running database connection validator...
    java -cp target\classes com.lms.test.DatabaseConnectionValidator
)

pause
