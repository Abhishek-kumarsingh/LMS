package com.lms.controller;

import com.lms.service.DatabaseTestService;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {

    @Autowired
    private DataSource dataSource;

    @Autowired
    private DatabaseTestService databaseTestService;

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("timestamp", LocalDateTime.now());
        health.put("service", "modern-lms-backend");
        health.put("version", "1.0.0");
        
        // Check database connectivity
        try (Connection connection = dataSource.getConnection()) {
            health.put("database", "UP");
        } catch (SQLException e) {
            health.put("database", "DOWN");
            health.put("status", "DOWN");
        }
        
        return ResponseEntity.ok(health);
    }

    @GetMapping("/health/ready")
    public ResponseEntity<Map<String, Object>> readiness() {
        Map<String, Object> readiness = new HashMap<>();
        boolean isReady = true;
        
        // Check database
        try (Connection connection = dataSource.getConnection()) {
            readiness.put("database", "READY");
        } catch (SQLException e) {
            readiness.put("database", "NOT_READY");
            isReady = false;
        }
        
        readiness.put("status", isReady ? "READY" : "NOT_READY");
        readiness.put("timestamp", LocalDateTime.now());
        
        return ResponseEntity.ok(readiness);
    }

    @GetMapping("/health/live")
    public ResponseEntity<Map<String, Object>> liveness() {
        Map<String, Object> liveness = new HashMap<>();
        liveness.put("status", "ALIVE");
        liveness.put("timestamp", LocalDateTime.now());
        liveness.put("uptime", System.currentTimeMillis());

        return ResponseEntity.ok(liveness);
    }

    @GetMapping("/health/database")
    public ResponseEntity<Map<String, Object>> databaseHealth() {
        Map<String, Object> dbStatus = databaseTestService.getDatabaseStatus();
        return ResponseEntity.ok(dbStatus);
    }
}
