@echo off
cd %~dp0
set SPRING_PROFILES_ACTIVE=test-h2
mvn test -Dtest=UserServiceTest