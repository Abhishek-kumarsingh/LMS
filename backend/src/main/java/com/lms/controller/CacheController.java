package com.lms.controller;

import com.lms.service.CacheService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/cache")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
@Slf4j
public class CacheController {

    private final CacheService cacheService;

    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CacheService.CacheStats> getCacheStats() {
        CacheService.CacheStats stats = cacheService.getCacheStats();
        return ResponseEntity.ok(stats);
    }

    @PostMapping("/clear")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> clearAllCaches() {
        cacheService.clearAll();
        Map<String, String> response = new HashMap<>();
        response.put("message", "All caches cleared successfully");
        response.put("timestamp", java.time.LocalDateTime.now().toString());
        log.info("All caches cleared by admin");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/clear/{cacheName}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> clearCache(@PathVariable String cacheName) {
        cacheService.clear(cacheName);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Cache '" + cacheName + "' cleared successfully");
        response.put("timestamp", java.time.LocalDateTime.now().toString());
        log.info("Cache '{}' cleared by admin", cacheName);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/evict/{cacheName}/{key}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> evictCacheKey(
            @PathVariable String cacheName, 
            @PathVariable String key) {
        cacheService.evict(cacheName, key);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Cache key '" + key + "' evicted from '" + cacheName + "'");
        response.put("timestamp", java.time.LocalDateTime.now().toString());
        log.info("Cache key '{}' evicted from '{}' by admin", key, cacheName);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/keys/{pattern}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Set<String>> getCacheKeys(@PathVariable String pattern) {
        Set<String> keys = cacheService.getKeys(pattern);
        return ResponseEntity.ok(keys);
    }

    @PostMapping("/warmup")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> warmUpCache() {
        cacheService.warmUpCache();
        Map<String, String> response = new HashMap<>();
        response.put("message", "Cache warm-up initiated");
        response.put("timestamp", java.time.LocalDateTime.now().toString());
        log.info("Cache warm-up initiated by admin");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/health")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getCacheHealth() {
        Map<String, Object> health = new HashMap<>();
        
        try {
            // Test cache connectivity
            String testKey = "health-check";
            String testValue = "test-" + System.currentTimeMillis();
            
            cacheService.put(CacheService.STATISTICS_CACHE, testKey, testValue);
            String retrievedValue = cacheService.get(CacheService.STATISTICS_CACHE, testKey, String.class);
            
            boolean isHealthy = testValue.equals(retrievedValue);
            
            health.put("status", isHealthy ? "UP" : "DOWN");
            health.put("timestamp", java.time.LocalDateTime.now());
            health.put("details", Map.of(
                "connectivity", isHealthy ? "OK" : "FAILED",
                "testKey", testKey,
                "testPassed", isHealthy
            ));
            
            // Clean up test data
            cacheService.evict(CacheService.STATISTICS_CACHE, testKey);
            
            return ResponseEntity.ok(health);
        } catch (Exception e) {
            health.put("status", "DOWN");
            health.put("timestamp", java.time.LocalDateTime.now());
            health.put("error", e.getMessage());
            log.error("Cache health check failed", e);
            return ResponseEntity.status(503).body(health);
        }
    }

    @GetMapping("/info")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getCacheInfo() {
        Map<String, Object> info = new HashMap<>();
        
        info.put("cacheNames", Map.of(
            "users", "User data cache (30 min TTL)",
            "courses", "Course data cache (2 hour TTL)",
            "categories", "Category data cache (6 hour TTL)",
            "enrollments", "Enrollment data cache (15 min TTL)",
            "statistics", "Statistics cache (5 min TTL)",
            "search", "Search results cache (10 min TTL)",
            "notifications", "Notifications cache (2 min TTL)"
        ));
        
        info.put("configuration", Map.of(
            "provider", "Redis",
            "defaultTTL", "1 hour",
            "serialization", "JSON"
        ));
        
        info.put("operations", Map.of(
            "clearAll", "POST /api/cache/clear",
            "clearSpecific", "POST /api/cache/clear/{cacheName}",
            "evictKey", "DELETE /api/cache/evict/{cacheName}/{key}",
            "warmUp", "POST /api/cache/warmup",
            "health", "GET /api/cache/health"
        ));
        
        return ResponseEntity.ok(info);
    }
}
