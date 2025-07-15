package com.lms.filter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lms.service.RateLimitService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class RateLimitFilter extends OncePerRequestFilter {

    private final RateLimitService rateLimitService;
    private final ObjectMapper objectMapper;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, 
                                  FilterChain filterChain) throws ServletException, IOException {
        
        String requestURI = request.getRequestURI();
        String method = request.getMethod();
        
        // Skip rate limiting for certain endpoints
        if (shouldSkipRateLimit(requestURI)) {
            filterChain.doFilter(request, response);
            return;
        }

        // Determine rate limit type based on endpoint
        String rateLimitType = determineRateLimitType(requestURI, method);
        String clientIdentifier = getClientIdentifier(request);
        
        // Check rate limit
        boolean allowed = checkRateLimit(rateLimitType, clientIdentifier, request);
        
        if (!allowed) {
            handleRateLimitExceeded(response, rateLimitType, clientIdentifier);
            return;
        }

        // Add rate limit headers to response
        addRateLimitHeaders(response, rateLimitType, clientIdentifier);
        
        filterChain.doFilter(request, response);
    }

    private boolean shouldSkipRateLimit(String requestURI) {
        // Skip rate limiting for health checks, actuator endpoints, and static resources
        return requestURI.startsWith("/api/actuator") ||
               requestURI.startsWith("/api/health") ||
               requestURI.startsWith("/static") ||
               requestURI.startsWith("/css") ||
               requestURI.startsWith("/js") ||
               requestURI.startsWith("/images") ||
               requestURI.equals("/favicon.ico");
    }

    private String determineRateLimitType(String requestURI, String method) {
        // Authentication endpoints
        if (requestURI.startsWith("/auth/")) {
            return "auth";
        }
        
        // Admin endpoints
        if (requestURI.startsWith("/api/admin/")) {
            return "admin";
        }
        
        // Upload endpoints
        if (requestURI.contains("/upload") || 
            (method.equals("POST") && (requestURI.contains("/avatar") || requestURI.contains("/thumbnail")))) {
            return "upload";
        }
        
        // Search endpoints
        if (requestURI.contains("/search") || requestURI.contains("/filter")) {
            return "search";
        }
        
        // Enrollment endpoints
        if (requestURI.contains("/enroll")) {
            return "enrollment";
        }
        
        // Default to general rate limit
        return "general";
    }

    private String getClientIdentifier(HttpServletRequest request) {
        // Try to get authenticated user ID first
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && 
            !authentication.getName().equals("anonymousUser")) {
            return "user:" + authentication.getName();
        }
        
        // Fall back to IP-based identification
        return rateLimitService.getClientIdentifier(request);
    }

    private boolean checkRateLimit(String type, String identifier, HttpServletRequest request) {
        return switch (type) {
            case "auth" -> rateLimitService.checkAuthRateLimit(request);
            case "admin" -> {
                String userId = extractUserIdFromIdentifier(identifier);
                yield rateLimitService.checkAdminRateLimit(userId, request);
            }
            case "upload" -> {
                String userId = extractUserIdFromIdentifier(identifier);
                yield rateLimitService.checkUploadRateLimit(userId, request);
            }
            case "search" -> {
                String userId = extractUserIdFromIdentifier(identifier);
                yield rateLimitService.checkSearchRateLimit(userId, request);
            }
            case "enrollment" -> {
                String userId = extractUserIdFromIdentifier(identifier);
                yield rateLimitService.checkEnrollmentRateLimit(userId);
            }
            default -> rateLimitService.checkGeneralRateLimit(request);
        };
    }

    private String extractUserIdFromIdentifier(String identifier) {
        if (identifier.startsWith("user:")) {
            return identifier.substring(5);
        }
        return null;
    }

    private void addRateLimitHeaders(HttpServletResponse response, String type, String identifier) {
        try {
            RateLimitService.RateLimitInfo info = rateLimitService.getRateLimitInfo(type, identifier);
            
            response.setHeader("X-RateLimit-Remaining", String.valueOf(info.getRemaining()));
            response.setHeader("X-RateLimit-Reset", String.valueOf(info.getResetTimeSeconds()));
            response.setHeader("X-RateLimit-Type", type);
        } catch (Exception e) {
            log.warn("Failed to add rate limit headers", e);
        }
    }

    private void handleRateLimitExceeded(HttpServletResponse response, String type, String identifier) 
            throws IOException {
        
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("error", "Rate limit exceeded");
        errorResponse.put("message", "Too many requests. Please try again later.");
        errorResponse.put("status", HttpStatus.TOO_MANY_REQUESTS.value());
        errorResponse.put("timestamp", LocalDateTime.now());
        errorResponse.put("type", type);
        
        // Add retry information
        try {
            RateLimitService.RateLimitInfo info = rateLimitService.getRateLimitInfo(type, identifier);
            errorResponse.put("retryAfter", info.getResetTimeSeconds());
            
            response.setHeader("Retry-After", String.valueOf(info.getResetTimeSeconds()));
            response.setHeader("X-RateLimit-Remaining", "0");
            response.setHeader("X-RateLimit-Reset", String.valueOf(info.getResetTimeSeconds()));
        } catch (Exception e) {
            log.warn("Failed to get rate limit info for error response", e);
        }
        
        String jsonResponse = objectMapper.writeValueAsString(errorResponse);
        response.getWriter().write(jsonResponse);
        
        log.warn("Rate limit exceeded for type: {}, identifier: {}", type, identifier);
    }
}
