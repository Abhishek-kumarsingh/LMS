package com.lms.service;

import com.lms.entity.User;
import com.lms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class DatabaseTestService implements CommandLineRunner {

    private final DataSource dataSource;
    private final UserRepository userRepository;

    @Override
    public void run(String... args) throws Exception {
        log.info("Starting database connection tests...");
        testDatabaseConnection();
        testDatabaseMetadata();
        testRepositoryConnection();
        log.info("Database connection tests completed successfully!");
    }

    public Map<String, Object> getDatabaseStatus() {
        Map<String, Object> status = new HashMap<>();
        
        try (Connection connection = dataSource.getConnection()) {
            status.put("connected", true);
            status.put("url", connection.getMetaData().getURL());
            status.put("driver", connection.getMetaData().getDriverName());
            status.put("version", connection.getMetaData().getDatabaseProductVersion());
            status.put("catalog", connection.getCatalog());
            status.put("schema", connection.getSchema());
            
            // Test query execution
            long userCount = userRepository.count();
            status.put("userCount", userCount);
            status.put("queryTest", "SUCCESS");
            
        } catch (SQLException e) {
            log.error("Database connection failed", e);
            status.put("connected", false);
            status.put("error", e.getMessage());
            status.put("queryTest", "FAILED");
        }
        
        return status;
    }

    private void testDatabaseConnection() {
        try (Connection connection = dataSource.getConnection()) {
            log.info("✅ Database connection successful!");
            log.info("Database URL: {}", connection.getMetaData().getURL());
            log.info("Database Driver: {}", connection.getMetaData().getDriverName());
            log.info("Database Version: {}", connection.getMetaData().getDatabaseProductVersion());
        } catch (SQLException e) {
            log.error("❌ Database connection failed: {}", e.getMessage());
            throw new RuntimeException("Database connection test failed", e);
        }
    }

    private void testDatabaseMetadata() {
        try (Connection connection = dataSource.getConnection()) {
            DatabaseMetaData metaData = connection.getMetaData();
            
            log.info("📊 Database Metadata:");
            log.info("  - Product Name: {}", metaData.getDatabaseProductName());
            log.info("  - Product Version: {}", metaData.getDatabaseProductVersion());
            log.info("  - Driver Name: {}", metaData.getDriverName());
            log.info("  - Driver Version: {}", metaData.getDriverVersion());
            log.info("  - Max Connections: {}", metaData.getMaxConnections());
            log.info("  - Default Transaction Isolation: {}", metaData.getDefaultTransactionIsolation());
            
            // List tables
            ResultSet tables = metaData.getTables(connection.getCatalog(), null, "%", new String[]{"TABLE"});
            List<String> tableNames = new ArrayList<>();
            while (tables.next()) {
                tableNames.add(tables.getString("TABLE_NAME"));
            }
            log.info("  - Available Tables: {}", tableNames);
            
        } catch (SQLException e) {
            log.error("❌ Failed to retrieve database metadata: {}", e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    private void testRepositoryConnection() {
        try {
            log.info("🔍 Testing repository connections...");
            
            // Test basic count query
            long userCount = userRepository.count();
            log.info("✅ User repository test successful - Total users: {}", userCount);
            
            // Test custom query
            long studentCount = userRepository.countByRole(User.Role.STUDENT);
            log.info("✅ Custom query test successful - Student count: {}", studentCount);
            
            // Test find operations
            List<User> enabledUsers = userRepository.findByIsEnabledTrue();
            log.info("✅ Find operation test successful - Enabled users: {}", enabledUsers.size());
            
        } catch (Exception e) {
            log.error("❌ Repository connection test failed: {}", e.getMessage());
            throw new RuntimeException("Repository test failed", e);
        }
    }

    public boolean isHealthy() {
        try (Connection connection = dataSource.getConnection()) {
            return connection.isValid(5); // 5 second timeout
        } catch (SQLException e) {
            log.error("Health check failed", e);
            return false;
        }
    }
}
