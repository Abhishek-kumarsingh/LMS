FROM openjdk:17-jdk-slim

WORKDIR /app

# Install Maven
RUN apt-get update && apt-get install -y maven && rm -rf /var/lib/apt/lists/*

# Copy pom.xml and download dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code
COPY src ./src

# Build the application
RUN mvn clean package -DskipTests

# Create directories for uploads and certificates
RUN mkdir -p /app/uploads /app/certificates /app/logs

# Expose port
EXPOSE 8080

# Run the application
CMD ["java", "-jar", "target/modern-lms-backend-0.0.1-SNAPSHOT.jar"]
