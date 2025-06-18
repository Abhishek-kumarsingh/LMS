package com.lms.config;

import com.lms.entity.User;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.UUID;

@TestConfiguration
@ActiveProfiles("test")
public class TestConfig {

    @Bean
    @Primary
    public PasswordEncoder testPasswordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Creates test users for integration tests
     */
    public static User createTestStudent() {
        User student = new User();
        student.setId(UUID.randomUUID().toString());
        student.setEmail("test.student@example.com");
        student.setPassword("$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9P2.nRs.fvuNinO"); // "password"
        student.setFirstName("Test");
        student.setLastName("Student");
        student.setRole(User.Role.STUDENT);
        student.setApproved(true);
        student.setEnabled(true);
        student.setCreatedAt(LocalDateTime.now());
        student.setUpdatedAt(LocalDateTime.now());
        return student;
    }

    public static User createTestInstructor() {
        User instructor = new User();
        instructor.setId(UUID.randomUUID().toString());
        instructor.setEmail("test.instructor@example.com");
        instructor.setPassword("$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9P2.nRs.fvuNinO"); // "password"
        instructor.setFirstName("Test");
        instructor.setLastName("Instructor");
        instructor.setRole(User.Role.INSTRUCTOR);
        instructor.setApproved(true);
        instructor.setEnabled(true);
        instructor.setCreatedAt(LocalDateTime.now());
        instructor.setUpdatedAt(LocalDateTime.now());
        return instructor;
    }

    public static User createTestAdmin() {
        User admin = new User();
        admin.setId(UUID.randomUUID().toString());
        admin.setEmail("test.admin@example.com");
        admin.setPassword("$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9P2.nRs.fvuNinO"); // "password"
        admin.setFirstName("Test");
        admin.setLastName("Admin");
        admin.setRole(User.Role.ADMIN);
        admin.setApproved(true);
        admin.setEnabled(true);
        admin.setCreatedAt(LocalDateTime.now());
        admin.setUpdatedAt(LocalDateTime.now());
        return admin;
    }
}
