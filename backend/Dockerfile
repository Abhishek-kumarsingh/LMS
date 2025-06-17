# Multi-stage build for Spring Boot backend
FROM maven:3.9.5-openjdk-17-slim as build

WORKDIR /app

# Copy pom.xml and download dependencies (for better caching)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code
COPY src ./src

# Build the application
RUN mvn clean package -DskipTests

# Production stage
FROM openjdk:17-jdk-slim

# Create non-root user for security
RUN groupadd -r lms && useradd -r -g lms lms

WORKDIR /app

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy built JAR from build stage
COPY --from=build /app/target/modern-lms-backend-0.0.1-SNAPSHOT.jar app.jar

# Create directories for uploads and certificates
RUN mkdir -p /app/uploads /app/certificates /app/logs && \
    chown -R lms:lms /app

# Switch to non-root user
USER lms

# Add labels for better container management
LABEL maintainer="LMS Team"
LABEL version="1.0"
LABEL description="Modern LMS Backend"

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8080/api/health || exit 1

# JVM optimization for containers
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:+UseG1GC -XX:+UseStringDeduplication"

# Run the application
CMD ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
