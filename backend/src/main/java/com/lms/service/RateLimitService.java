package com.lms.service;

import com.lms.config.RateLimitConfig;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.servlet.http.HttpServletRequest;
import java.time.Duration;

@Service
@RequiredArgsConstructor
@Slf4j
public class RateLimitService {

    private final RateLimitConfig rateLimitConfig;

    /**
     * Check if request is allowed based on rate limit
     */
    public boolean isAllowed(String type, String key) {
        return isAllowed(type, key, 1);
    }

    /**
     * Check if request is allowed based on rate limit with custom token count
     */
    public boolean isAllowed(String type, String key, long tokens) {
        try {
            Bucket bucket = rateLimitConfig.getBucket(type, key);
            ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(tokens);
            
            if (probe.isConsumed()) {
                log.debug("Rate limit check passed for {}:{}, remaining tokens: {}", 
                         type, key, probe.getRemainingTokens());
                return true;
            } else {
                log.warn("Rate limit exceeded for {}:{}, retry after: {} seconds", 
                        type, key, probe.getNanosToWaitForRefill() / 1_000_000_000);
                return false;
            }
        } catch (Exception e) {
            log.error("Error checking rate limit for {}:{}", type, key, e);
            // Fail open - allow request if rate limiting fails
            return true;
        }
    }

    /**
     * Get remaining tokens for a bucket
     */
    public long getRemainingTokens(String type, String key) {
        try {
            Bucket bucket = rateLimitConfig.getBucket(type, key);
            return bucket.getAvailableTokens();
        } catch (Exception e) {
            log.error("Error getting remaining tokens for {}:{}", type, key, e);
            return 0;
        }
    }

    /**
     * Get time until next refill
     */
    public Duration getTimeUntilRefill(String type, String key) {
        try {
            Bucket bucket = rateLimitConfig.getBucket(type, key);
            ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(0);
            return Duration.ofNanos(probe.getNanosToWaitForRefill());
        } catch (Exception e) {
            log.error("Error getting refill time for {}:{}", type, key, e);
            return Duration.ZERO;
        }
    }

    /**
     * Extract client identifier from request
     */
    public String getClientIdentifier(HttpServletRequest request) {
        // Try to get real IP address
        String clientIp = getClientIpAddress(request);
        
        // For authenticated users, we could also use user ID
        // This would require access to the authentication context
        
        return clientIp;
    }

    /**
     * Extract client IP address from request
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty() && !"unknown".equalsIgnoreCase(xForwardedFor)) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty() && !"unknown".equalsIgnoreCase(xRealIp)) {
            return xRealIp;
        }
        
        String xForwardedProto = request.getHeader("X-Forwarded-Proto");
        if (xForwardedProto != null) {
            String cfConnectingIp = request.getHeader("CF-Connecting-IP");
            if (cfConnectingIp != null && !cfConnectingIp.isEmpty()) {
                return cfConnectingIp;
            }
        }
        
        return request.getRemoteAddr();
    }

    /**
     * Get user-specific identifier for authenticated requests
     */
    public String getUserIdentifier(String userId, HttpServletRequest request) {
        if (userId != null && !userId.isEmpty()) {
            return "user:" + userId;
        }
        return getClientIdentifier(request);
    }

    /**
     * Check rate limit for authentication requests
     */
    public boolean checkAuthRateLimit(HttpServletRequest request) {
        String clientId = getClientIdentifier(request);
        return isAllowed("auth", clientId);
    }

    /**
     * Check rate limit for general API requests
     */
    public boolean checkGeneralRateLimit(HttpServletRequest request) {
        String clientId = getClientIdentifier(request);
        return isAllowed("general", clientId);
    }

    /**
     * Check rate limit for upload requests
     */
    public boolean checkUploadRateLimit(String userId, HttpServletRequest request) {
        String identifier = getUserIdentifier(userId, request);
        return isAllowed("upload", identifier);
    }

    /**
     * Check rate limit for search requests
     */
    public boolean checkSearchRateLimit(String userId, HttpServletRequest request) {
        String identifier = getUserIdentifier(userId, request);
        return isAllowed("search", identifier);
    }

    /**
     * Check rate limit for admin requests
     */
    public boolean checkAdminRateLimit(String userId, HttpServletRequest request) {
        String identifier = getUserIdentifier(userId, request);
        return isAllowed("admin", identifier);
    }

    /**
     * Check rate limit for email sending
     */
    public boolean checkEmailRateLimit(String userId) {
        return isAllowed("email", "user:" + userId);
    }

    /**
     * Check rate limit for course enrollment
     */
    public boolean checkEnrollmentRateLimit(String userId) {
        return isAllowed("enrollment", "user:" + userId);
    }

    /**
     * Get rate limit info for response headers
     */
    public RateLimitInfo getRateLimitInfo(String type, String key) {
        try {
            Bucket bucket = rateLimitConfig.getBucket(type, key);
            long remaining = bucket.getAvailableTokens();
            Duration resetTime = getTimeUntilRefill(type, key);
            
            return new RateLimitInfo(remaining, resetTime);
        } catch (Exception e) {
            log.error("Error getting rate limit info for {}:{}", type, key, e);
            return new RateLimitInfo(0, Duration.ZERO);
        }
    }

    /**
     * Rate limit information for response headers
     */
    public static class RateLimitInfo {
        private final long remaining;
        private final Duration resetTime;

        public RateLimitInfo(long remaining, Duration resetTime) {
            this.remaining = remaining;
            this.resetTime = resetTime;
        }

        public long getRemaining() { return remaining; }
        public Duration getResetTime() { return resetTime; }
        public long getResetTimeSeconds() { return resetTime.getSeconds(); }
    }
}
