package com.lms.test;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.ResultSet;

/**
 * Standalone Database Connection Validator
 * This class tests database connections without Spring Boot dependencies
 */
public class DatabaseConnectionValidator {
    
    public static void main(String[] args) {
        System.out.println("=================================================");
        System.out.println("Database Connection Validator");
        System.out.println("=================================================");
        System.out.println();
        
        // Test H2 Database Connection (Local Development)
        testH2Connection();
        
        System.out.println();
        
        // Test MySQL Connection (if available)
        testMySQLConnection();
        
        System.out.println();
        System.out.println("=================================================");
        System.out.println("Database Connection Validation Complete!");
        System.out.println("=================================================");
    }
    
    private static void testH2Connection() {
        System.out.println("🔍 Testing H2 Database Connection (Local Development)");
        System.out.println("---------------------------------------------------");
        
        String url = "jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE";
        String username = "sa";
        String password = "";
        
        try {
            // Load H2 driver
            Class.forName("org.h2.Driver");
            
            // Test connection
            try (Connection connection = DriverManager.getConnection(url, username, password)) {
                System.out.println("✅ H2 Connection successful!");
                System.out.println("   URL: " + url);
                System.out.println("   Driver: " + connection.getMetaData().getDriverName());
                System.out.println("   Version: " + connection.getMetaData().getDatabaseProductVersion());
                
                // Test basic operations
                testBasicOperations(connection, "H2");
                
            }
        } catch (ClassNotFoundException e) {
            System.out.println("❌ H2 Driver not found: " + e.getMessage());
            System.out.println("   This is expected if H2 dependency is not in classpath");
        } catch (SQLException e) {
            System.out.println("❌ H2 Connection failed: " + e.getMessage());
        }
    }
    
    private static void testMySQLConnection() {
        System.out.println("🔍 Testing MySQL Database Connection (Production)");
        System.out.println("------------------------------------------------");
        
        String url = "jdbc:mysql://localhost:3306/modern_lms?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true";
        String username = "lms_user";
        String password = "lms_password";
        
        try {
            // Load MySQL driver
            Class.forName("com.mysql.cj.jdbc.Driver");
            
            // Test connection
            try (Connection connection = DriverManager.getConnection(url, username, password)) {
                System.out.println("✅ MySQL Connection successful!");
                System.out.println("   URL: " + url);
                System.out.println("   Driver: " + connection.getMetaData().getDriverName());
                System.out.println("   Version: " + connection.getMetaData().getDatabaseProductVersion());
                
                // Test basic operations
                testBasicOperations(connection, "MySQL");
                
            }
        } catch (ClassNotFoundException e) {
            System.out.println("❌ MySQL Driver not found: " + e.getMessage());
            System.out.println("   This is expected if MySQL dependency is not in classpath");
        } catch (SQLException e) {
            System.out.println("⚠️  MySQL Connection failed: " + e.getMessage());
            System.out.println("   This is expected if MySQL server is not running");
            System.out.println("   Start MySQL with: docker-compose up -d mysql");
        }
    }
    
    private static void testBasicOperations(Connection connection, String dbType) {
        try {
            System.out.println("   Testing basic operations...");
            
            // Test simple query
            try (Statement stmt = connection.createStatement()) {
                ResultSet rs = stmt.executeQuery("SELECT 1 as test_value");
                if (rs.next()) {
                    int value = rs.getInt("test_value");
                    System.out.println("   ✅ Basic query successful: " + value);
                }
            }
            
            // Test table creation (for H2)
            if ("H2".equals(dbType)) {
                try (Statement stmt = connection.createStatement()) {
                    stmt.execute("CREATE TABLE IF NOT EXISTS test_table (id INT PRIMARY KEY, name VARCHAR(50))");
                    stmt.execute("INSERT INTO test_table (id, name) VALUES (1, 'Test User')");
                    
                    ResultSet rs = stmt.executeQuery("SELECT COUNT(*) as count FROM test_table");
                    if (rs.next()) {
                        int count = rs.getInt("count");
                        System.out.println("   ✅ Table operations successful: " + count + " records");
                    }
                }
            }
            
            System.out.println("   ✅ " + dbType + " database is fully functional!");
            
        } catch (SQLException e) {
            System.out.println("   ❌ Basic operations failed: " + e.getMessage());
        }
    }
}
