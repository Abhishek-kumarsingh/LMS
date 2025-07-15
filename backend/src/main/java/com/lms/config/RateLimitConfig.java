package com.lms.config;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Bucket4j;
import io.github.bucket4j.Refill;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.core.RedisTemplate;

import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;

@Configuration
@Slf4j
public class RateLimitConfig {

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    // In-memory cache for rate limit buckets (fallback if Redis is unavailable)
    private final ConcurrentHashMap<String, Bucket> bucketCache = new ConcurrentHashMap<>();

    /**
     * Create rate limit bucket for general API requests
     * 100 requests per minute per IP
     */
    public Bucket createGeneralBucket(String key) {
        return bucketCache.computeIfAbsent(key, k -> {
            Bandwidth limit = Bandwidth.classic(100, Refill.intervally(100, Duration.ofMinutes(1)));
            return Bucket4j.builder()
                    .addLimit(limit)
                    .build();
        });
    }

    /**
     * Create rate limit bucket for authentication requests
     * 10 requests per minute per IP (stricter for login/register)
     */
    public Bucket createAuthBucket(String key) {
        return bucketCache.computeIfAbsent("auth:" + key, k -> {
            Bandwidth limit = Bandwidth.classic(10, Refill.intervally(10, Duration.ofMinutes(1)));
            return Bucket4j.builder()
                    .addLimit(limit)
                    .build();
        });
    }

    /**
     * Create rate limit bucket for file upload requests
     * 20 requests per hour per user (file uploads are resource intensive)
     */
    public Bucket createUploadBucket(String key) {
        return bucketCache.computeIfAbsent("upload:" + key, k -> {
            Bandwidth limit = Bandwidth.classic(20, Refill.intervally(20, Duration.ofHours(1)));
            return Bucket4j.builder()
                    .addLimit(limit)
                    .build();
        });
    }

    /**
     * Create rate limit bucket for search requests
     * 200 requests per minute per user (search can be frequent)
     */
    public Bucket createSearchBucket(String key) {
        return bucketCache.computeIfAbsent("search:" + key, k -> {
            Bandwidth limit = Bandwidth.classic(200, Refill.intervally(200, Duration.ofMinutes(1)));
            return Bucket4j.builder()
                    .addLimit(limit)
                    .build();
        });
    }

    /**
     * Create rate limit bucket for admin operations
     * 50 requests per minute per admin user
     */
    public Bucket createAdminBucket(String key) {
        return bucketCache.computeIfAbsent("admin:" + key, k -> {
            Bandwidth limit = Bandwidth.classic(50, Refill.intervally(50, Duration.ofMinutes(1)));
            return Bucket4j.builder()
                    .addLimit(limit)
                    .build();
        });
    }

    /**
     * Create rate limit bucket for email sending
     * 5 emails per hour per user
     */
    public Bucket createEmailBucket(String key) {
        return bucketCache.computeIfAbsent("email:" + key, k -> {
            Bandwidth limit = Bandwidth.classic(5, Refill.intervally(5, Duration.ofHours(1)));
            return Bucket4j.builder()
                    .addLimit(limit)
                    .build();
        });
    }

    /**
     * Create rate limit bucket for course enrollment
     * 10 enrollments per hour per user
     */
    public Bucket createEnrollmentBucket(String key) {
        return bucketCache.computeIfAbsent("enrollment:" + key, k -> {
            Bandwidth limit = Bandwidth.classic(10, Refill.intervally(10, Duration.ofHours(1)));
            return Bucket4j.builder()
                    .addLimit(limit)
                    .build();
        });
    }

    /**
     * Get bucket by type and key
     */
    public Bucket getBucket(String type, String key) {
        return switch (type.toLowerCase()) {
            case "auth" -> createAuthBucket(key);
            case "upload" -> createUploadBucket(key);
            case "search" -> createSearchBucket(key);
            case "admin" -> createAdminBucket(key);
            case "email" -> createEmailBucket(key);
            case "enrollment" -> createEnrollmentBucket(key);
            default -> createGeneralBucket(key);
        };
    }

    /**
     * Clear all rate limit buckets (for testing or admin purposes)
     */
    public void clearAllBuckets() {
        bucketCache.clear();
        log.info("All rate limit buckets cleared");
    }

    /**
     * Get current bucket cache size
     */
    public int getBucketCacheSize() {
        return bucketCache.size();
    }
}
