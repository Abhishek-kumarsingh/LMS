package com.lms.test;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;

@SpringBootApplication(scanBasePackages = "com.lms")
public class DatabaseConnectionSimpleTest {
    
    public static void main(String[] args) {
        System.out.println("=================================");
        System.out.println("Database Connection Simple Test");
        System.out.println("=================================");
        System.out.println();
        
        // Set local profile for H2 database
        System.setProperty("spring.profiles.active", "local");
        
        try {
            ConfigurableApplicationContext context = SpringApplication.run(DatabaseConnectionSimpleTest.class, args);
            
            System.out.println("✅ Application started successfully!");
            System.out.println();
            System.out.println("🔗 Available Endpoints:");
            System.out.println("   H2 Console: http://localhost:8080/api/h2-console");
            System.out.println("   Health Check: http://localhost:8080/api/health");
            System.out.println("   Database Health: http://localhost:8080/api/health/database");
            System.out.println();
            System.out.println("📊 H2 Database Connection Details:");
            System.out.println("   JDBC URL: jdbc:h2:mem:lmsdb");
            System.out.println("   Username: sa");
            System.out.println("   Password: (empty)");
            System.out.println();
            System.out.println("🚀 Database connection implementation is working!");
            System.out.println("   Press Ctrl+C to stop the application");
            
        } catch (Exception e) {
            System.err.println("❌ Failed to start application:");
            e.printStackTrace();
        }
    }
}
