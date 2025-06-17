@echo off
echo Starting Modern LMS Backend with Local Profile...
echo.
echo This will use H2 in-memory database for testing
echo H2 Console will be available at: http://localhost:8080/api/h2-console
echo.
echo Database Connection Details:
echo - JDBC URL: jdbc:h2:mem:lmsdb
echo - Username: sa
echo - Password: (empty)
echo.
echo Starting application...
java -Dspring.profiles.active=local -cp "target/classes;target/dependency/*" com.lms.ModernLmsApplication
pause
