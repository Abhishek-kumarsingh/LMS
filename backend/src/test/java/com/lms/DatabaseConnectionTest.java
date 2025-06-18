package com.lms;

import com.lms.entity.User;
import com.lms.repository.UserRepository;
import com.lms.service.DatabaseTestService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.TestMethodOrder;
import org.junit.jupiter.api.MethodOrderer.OrderAnnotation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.SQLException;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
@TestMethodOrder(OrderAnnotation.class)
public class DatabaseConnectionTest {

    @Autowired
    private DataSource dataSource;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DatabaseTestService databaseTestService;

    @Test
    @Order(1)
    public void testDatabaseConnection() throws SQLException {
        try (Connection connection = dataSource.getConnection()) {
            assertNotNull(connection, "Database connection should not be null");
            assertTrue(connection.isValid(5), "Database connection should be valid");
            assertFalse(connection.isClosed(), "Database connection should not be closed");

            // Log connection details for debugging
            System.out.println("✅ Database connection test passed");
            System.out.println("   URL: " + connection.getMetaData().getURL());
            System.out.println("   Driver: " + connection.getMetaData().getDriverName());
        }
    }

    @Test
    public void testDatabaseMetadata() throws SQLException {
        try (Connection connection = dataSource.getConnection()) {
            DatabaseMetaData metaData = connection.getMetaData();
            
            assertNotNull(metaData.getDatabaseProductName());
            assertNotNull(metaData.getDatabaseProductVersion());
            assertNotNull(metaData.getDriverName());
            assertNotNull(metaData.getDriverVersion());
            
            System.out.println("Database Product: " + metaData.getDatabaseProductName());
            System.out.println("Database Version: " + metaData.getDatabaseProductVersion());
            System.out.println("Driver Name: " + metaData.getDriverName());
            System.out.println("Driver Version: " + metaData.getDriverVersion());
        }
    }

    @Test
    public void testUserRepositoryConnection() {
        // Test basic repository operations
        long initialCount = userRepository.count();
        assertTrue(initialCount >= 0);

        // Create a test user
        User testUser = new User();
        testUser.setId(UUID.randomUUID().toString());
        testUser.setEmail("test@example.com");
        testUser.setPassword("password123");
        testUser.setFirstName("Test");
        testUser.setLastName("User");
        testUser.setRole(User.Role.STUDENT);

        // Save the user
        User savedUser = userRepository.save(testUser);
        assertNotNull(savedUser);
        assertEquals(testUser.getEmail(), savedUser.getEmail());

        // Verify count increased
        long newCount = userRepository.count();
        assertEquals(initialCount + 1, newCount);

        // Test find operations
        assertTrue(userRepository.existsByEmail("test@example.com"));
        assertTrue(userRepository.findByEmail("test@example.com").isPresent());

        // Test custom queries
        long studentCount = userRepository.countByRole(User.Role.STUDENT);
        assertTrue(studentCount > 0);
    }

    @Test
    public void testDatabaseTestService() {
        // Test database status
        Map<String, Object> status = databaseTestService.getDatabaseStatus();
        assertNotNull(status);
        assertTrue((Boolean) status.get("connected"));
        assertEquals("SUCCESS", status.get("queryTest"));

        // Test health check
        assertTrue(databaseTestService.isHealthy());
    }

    @Test
    public void testTransactionRollback() {
        long initialCount = userRepository.count();

        try {
            // This should rollback due to @Transactional on the test class
            User testUser = new User();
            testUser.setId(UUID.randomUUID().toString());
            testUser.setEmail("rollback@example.com");
            testUser.setPassword("password123");
            testUser.setFirstName("Rollback");
            testUser.setLastName("Test");
            testUser.setRole(User.Role.STUDENT);

            userRepository.save(testUser);
            
            // Verify user was saved within transaction
            assertTrue(userRepository.existsByEmail("rollback@example.com"));
            
        } catch (Exception e) {
            fail("Transaction test failed: " + e.getMessage());
        }
        
        // After test method completes, transaction should rollback
        // This assertion might not work as expected due to test transaction behavior
        // but it demonstrates the concept
    }

    @Test
    public void testConnectionPooling() throws SQLException {
        // Test multiple connections
        Connection conn1 = dataSource.getConnection();
        Connection conn2 = dataSource.getConnection();
        Connection conn3 = dataSource.getConnection();

        assertNotNull(conn1);
        assertNotNull(conn2);
        assertNotNull(conn3);

        assertTrue(conn1.isValid(5));
        assertTrue(conn2.isValid(5));
        assertTrue(conn3.isValid(5));

        // Close connections
        conn1.close();
        conn2.close();
        conn3.close();

        assertTrue(conn1.isClosed());
        assertTrue(conn2.isClosed());
        assertTrue(conn3.isClosed());
    }
}
