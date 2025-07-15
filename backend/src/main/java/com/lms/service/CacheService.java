package com.lms.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Set;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class CacheService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final CacheManager cacheManager;

    // Cache names constants
    public static final String USERS_CACHE = "users";
    public static final String COURSES_CACHE = "courses";
    public static final String CATEGORIES_CACHE = "categories";
    public static final String ENROLLMENTS_CACHE = "enrollments";
    public static final String STATISTICS_CACHE = "statistics";
    public static final String SEARCH_CACHE = "search";
    public static final String NOTIFICATIONS_CACHE = "notifications";

    /**
     * Store a value in cache with custom TTL
     */
    public void put(String cacheName, String key, Object value, Duration ttl) {
        try {
            String fullKey = cacheName + "::" + key;
            redisTemplate.opsForValue().set(fullKey, value, ttl.toMillis(), TimeUnit.MILLISECONDS);
            log.debug("Cached value for key: {} with TTL: {}", fullKey, ttl);
        } catch (Exception e) {
            log.error("Failed to cache value for key: {}::{}", cacheName, key, e);
        }
    }

    /**
     * Store a value in cache with default TTL
     */
    public void put(String cacheName, String key, Object value) {
        try {
            Cache cache = cacheManager.getCache(cacheName);
            if (cache != null) {
                cache.put(key, value);
                log.debug("Cached value for key: {}::{}", cacheName, key);
            }
        } catch (Exception e) {
            log.error("Failed to cache value for key: {}::{}", cacheName, key, e);
        }
    }

    /**
     * Get a value from cache
     */
    @SuppressWarnings("unchecked")
    public <T> T get(String cacheName, String key, Class<T> type) {
        try {
            Cache cache = cacheManager.getCache(cacheName);
            if (cache != null) {
                Cache.ValueWrapper wrapper = cache.get(key);
                if (wrapper != null) {
                    Object value = wrapper.get();
                    if (type.isInstance(value)) {
                        log.debug("Cache hit for key: {}::{}", cacheName, key);
                        return type.cast(value);
                    }
                }
            }
            log.debug("Cache miss for key: {}::{}", cacheName, key);
            return null;
        } catch (Exception e) {
            log.error("Failed to get cached value for key: {}::{}", cacheName, key, e);
            return null;
        }
    }

    /**
     * Remove a specific key from cache
     */
    public void evict(String cacheName, String key) {
        try {
            Cache cache = cacheManager.getCache(cacheName);
            if (cache != null) {
                cache.evict(key);
                log.debug("Evicted cache key: {}::{}", cacheName, key);
            }
        } catch (Exception e) {
            log.error("Failed to evict cache key: {}::{}", cacheName, key, e);
        }
    }

    /**
     * Clear all entries in a cache
     */
    public void clear(String cacheName) {
        try {
            Cache cache = cacheManager.getCache(cacheName);
            if (cache != null) {
                cache.clear();
                log.info("Cleared cache: {}", cacheName);
            }
        } catch (Exception e) {
            log.error("Failed to clear cache: {}", cacheName, e);
        }
    }

    /**
     * Clear all caches
     */
    public void clearAll() {
        try {
            cacheManager.getCacheNames().forEach(this::clear);
            log.info("Cleared all caches");
        } catch (Exception e) {
            log.error("Failed to clear all caches", e);
        }
    }

    /**
     * Check if a key exists in cache
     */
    public boolean exists(String cacheName, String key) {
        try {
            Cache cache = cacheManager.getCache(cacheName);
            if (cache != null) {
                return cache.get(key) != null;
            }
            return false;
        } catch (Exception e) {
            log.error("Failed to check cache existence for key: {}::{}", cacheName, key, e);
            return false;
        }
    }

    /**
     * Get cache statistics
     */
    public CacheStats getCacheStats() {
        try {
            CacheStats stats = new CacheStats();
            
            // Get Redis info
            String info = redisTemplate.getConnectionFactory().getConnection().info("memory").toString();
            stats.setRedisInfo(info);
            
            // Get cache names
            stats.setCacheNames(cacheManager.getCacheNames());
            
            return stats;
        } catch (Exception e) {
            log.error("Failed to get cache statistics", e);
            return new CacheStats();
        }
    }

    /**
     * Warm up cache with frequently accessed data
     */
    public void warmUpCache() {
        log.info("Starting cache warm-up process...");
        try {
            // This method can be called during application startup
            // to pre-populate cache with frequently accessed data
            log.info("Cache warm-up completed successfully");
        } catch (Exception e) {
            log.error("Cache warm-up failed", e);
        }
    }

    /**
     * Get all keys matching a pattern
     */
    public Set<String> getKeys(String pattern) {
        try {
            return redisTemplate.keys(pattern);
        } catch (Exception e) {
            log.error("Failed to get keys for pattern: {}", pattern, e);
            return Set.of();
        }
    }

    /**
     * Set expiration for a key
     */
    public void expire(String cacheName, String key, Duration ttl) {
        try {
            String fullKey = cacheName + "::" + key;
            redisTemplate.expire(fullKey, ttl);
            log.debug("Set expiration for key: {} to {}", fullKey, ttl);
        } catch (Exception e) {
            log.error("Failed to set expiration for key: {}::{}", cacheName, key, e);
        }
    }

    // Inner class for cache statistics
    public static class CacheStats {
        private String redisInfo;
        private Set<String> cacheNames;

        public String getRedisInfo() { return redisInfo; }
        public void setRedisInfo(String redisInfo) { this.redisInfo = redisInfo; }
        public Set<String> getCacheNames() { return cacheNames; }
        public void setCacheNames(Set<String> cacheNames) { this.cacheNames = cacheNames; }
    }
}
