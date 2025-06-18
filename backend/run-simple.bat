@echo off
echo Simple Database Connection Test
echo ================================
echo.

REM First, let's try to start Docker Desktop if it's not running
echo Checking if Docker Desktop is available...
docker --version >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Docker is available. Checking if it's running...
    docker ps >nul 2>&1
    if %ERRORLEVEL% NEQ 0 (
        echo Docker Desktop is not running. Please start Docker Desktop manually.
        echo After starting Docker Desktop, you can run the full database setup.
        echo.
        echo For now, we'll proceed with H2 in-memory database testing.
        echo.
    ) else (
        echo Docker is running! You can use the full MySQL setup.
        echo.
    )
) else (
    echo Docker is not installed.
    echo We'll proceed with H2 in-memory database testing.
    echo.
)

echo Creating a simple test to verify database connection setup...
echo.

REM Create a simple test class
echo Creating DatabaseConnectionSimpleTest.java...

echo package com.lms.test; > src\main\java\com\lms\test\DatabaseConnectionSimpleTest.java
echo. >> src\main\java\com\lms\test\DatabaseConnectionSimpleTest.java
echo import org.springframework.boot.SpringApplication; >> src\main\java\com\lms\test\DatabaseConnectionSimpleTest.java
echo import org.springframework.boot.autoconfigure.SpringBootApplication; >> src\main\java\com\lms\test\DatabaseConnectionSimpleTest.java
echo import org.springframework.context.ConfigurableApplicationContext; >> src\main\java\com\lms\test\DatabaseConnectionSimpleTest.java
echo. >> src\main\java\com\lms\test\DatabaseConnectionSimpleTest.java
echo @SpringBootApplication(scanBasePackages = "com.lms") >> src\main\java\com\lms\test\DatabaseConnectionSimpleTest.java
echo public class DatabaseConnectionSimpleTest { >> src\main\java\com\lms\test\DatabaseConnectionSimpleTest.java
echo     public static void main(String[] args) { >> src\main\java\com\lms\test\DatabaseConnectionSimpleTest.java
echo         System.setProperty("spring.profiles.active", "local"); >> src\main\java\com\lms\test\DatabaseConnectionSimpleTest.java
echo         ConfigurableApplicationContext context = SpringApplication.run(DatabaseConnectionSimpleTest.class, args); >> src\main\java\com\lms\test\DatabaseConnectionSimpleTest.java
echo         System.out.println("Application started successfully!"); >> src\main\java\com\lms\test\DatabaseConnectionSimpleTest.java
echo         System.out.println("H2 Console: http://localhost:8080/api/h2-console"); >> src\main\java\com\lms\test\DatabaseConnectionSimpleTest.java
echo         System.out.println("Health Check: http://localhost:8080/api/health"); >> src\main\java\com\lms\test\DatabaseConnectionSimpleTest.java
echo     } >> src\main\java\com\lms\test\DatabaseConnectionSimpleTest.java
echo } >> src\main\java\com\lms\test\DatabaseConnectionSimpleTest.java

echo.
echo Simple test class created!
echo.
echo Next steps:
echo 1. Open your IDE (IntelliJ IDEA, Eclipse, VS Code)
echo 2. Import this project as a Maven project
echo 3. Run the DatabaseConnectionSimpleTest class
echo 4. Or run the main ModernLmsApplication class with profile 'local'
echo.
echo Alternative: If you have Maven installed:
echo   mvn spring-boot:run -Dspring-boot.run.profiles=local
echo.
pause
