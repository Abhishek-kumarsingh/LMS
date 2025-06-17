@echo off
echo Setting up Maven Daemon (mvnd) environment...

REM Find Java installation
for /f "tokens=2*" %%i in ('reg query "HKEY_LOCAL_MACHINE\SOFTWARE\JavaSoft\JDK" /s /v JavaHome 2^>nul ^| find "JavaHome"') do set JAVA_HOME=%%j

REM If not found, try alternative locations
if not defined JAVA_HOME (
    if exist "C:\Program Files\Java\jdk-17" set JAVA_HOME=C:\Program Files\Java\jdk-17
    if exist "C:\Program Files\Java\jdk-21" set JAVA_HOME=C:\Program Files\Java\jdk-21
    if exist "C:\Program Files\Eclipse Adoptium\jdk-17*" for /d %%i in ("C:\Program Files\Eclipse Adoptium\jdk-17*") do set JAVA_HOME=%%i
)

REM Set Maven Daemon path
set MVND_HOME=D:\maven-mvnd-1.0.2-windows-amd64\maven-mvnd-1.0.2-windows-amd64
set PATH=%MVND_HOME%\bin;%PATH%

echo JAVA_HOME: %JAVA_HOME%
echo MVND_HOME: %MVND_HOME%
echo.

REM Test mvnd
echo Testing mvnd installation...
mvnd --version

echo.
echo Environment setup complete!
echo You can now use 'mvnd' commands in this terminal session.
echo.
pause
