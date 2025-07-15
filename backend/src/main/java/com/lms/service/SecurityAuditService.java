package com.lms.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
public class SecurityAuditService {

    /**
     * Log successful authentication
     */
    public void logSuccessfulAuthentication(String username, HttpServletRequest request) {
        Map<String, Object> auditData = createBaseAuditData("AUTHENTICATION_SUCCESS", request);
        auditData.put("username", username);
        
        log.info("Security Audit: {}", auditData);
    }

    /**
     * Log failed authentication attempt
     */
    public void logFailedAuthentication(String username, String reason, HttpServletRequest request) {
        Map<String, Object> auditData = createBaseAuditData("AUTHENTICATION_FAILURE", request);
        auditData.put("username", username);
        auditData.put("reason", reason);
        
        log.warn("Security Audit: {}", auditData);
    }

    /**
     * Log access denied event
     */
    public void logAccessDenied(String username, String resource, HttpServletRequest request) {
        Map<String, Object> auditData = createBaseAuditData("ACCESS_DENIED", request);
        auditData.put("username", username);
        auditData.put("resource", resource);
        
        log.warn("Security Audit: {}", auditData);
    }

    /**
     * Log rate limit exceeded
     */
    public void logRateLimitExceeded(String identifier, String limitType, HttpServletRequest request) {
        Map<String, Object> auditData = createBaseAuditData("RATE_LIMIT_EXCEEDED", request);
        auditData.put("identifier", identifier);
        auditData.put("limitType", limitType);
        
        log.warn("Security Audit: {}", auditData);
    }

    /**
     * Log suspicious activity
     */
    public void logSuspiciousActivity(String description, String username, HttpServletRequest request) {
        Map<String, Object> auditData = createBaseAuditData("SUSPICIOUS_ACTIVITY", request);
        auditData.put("description", description);
        auditData.put("username", username);
        
        log.error("Security Audit: {}", auditData);
    }

    /**
     * Log privilege escalation attempt
     */
    public void logPrivilegeEscalation(String username, String attemptedAction, HttpServletRequest request) {
        Map<String, Object> auditData = createBaseAuditData("PRIVILEGE_ESCALATION", request);
        auditData.put("username", username);
        auditData.put("attemptedAction", attemptedAction);
        
        log.error("Security Audit: {}", auditData);
    }

    /**
     * Log data access events
     */
    public void logDataAccess(String username, String dataType, String action, String resourceId) {
        Map<String, Object> auditData = new HashMap<>();
        auditData.put("eventType", "DATA_ACCESS");
        auditData.put("timestamp", LocalDateTime.now());
        auditData.put("username", username);
        auditData.put("dataType", dataType);
        auditData.put("action", action);
        auditData.put("resourceId", resourceId);
        
        log.info("Security Audit: {}", auditData);
    }

    /**
     * Log password change events
     */
    public void logPasswordChange(String username, boolean successful, HttpServletRequest request) {
        Map<String, Object> auditData = createBaseAuditData("PASSWORD_CHANGE", request);
        auditData.put("username", username);
        auditData.put("successful", successful);
        
        if (successful) {
            log.info("Security Audit: {}", auditData);
        } else {
            log.warn("Security Audit: {}", auditData);
        }
    }

    /**
     * Log account lockout events
     */
    public void logAccountLockout(String username, String reason, HttpServletRequest request) {
        Map<String, Object> auditData = createBaseAuditData("ACCOUNT_LOCKOUT", request);
        auditData.put("username", username);
        auditData.put("reason", reason);
        
        log.warn("Security Audit: {}", auditData);
    }

    /**
     * Log file upload events
     */
    public void logFileUpload(String username, String fileName, long fileSize, String fileType, 
                             boolean successful, HttpServletRequest request) {
        Map<String, Object> auditData = createBaseAuditData("FILE_UPLOAD", request);
        auditData.put("username", username);
        auditData.put("fileName", fileName);
        auditData.put("fileSize", fileSize);
        auditData.put("fileType", fileType);
        auditData.put("successful", successful);
        
        if (successful) {
            log.info("Security Audit: {}", auditData);
        } else {
            log.warn("Security Audit: {}", auditData);
        }
    }

    /**
     * Log admin actions
     */
    public void logAdminAction(String adminUsername, String action, String targetUser, 
                              Map<String, Object> details, HttpServletRequest request) {
        Map<String, Object> auditData = createBaseAuditData("ADMIN_ACTION", request);
        auditData.put("adminUsername", adminUsername);
        auditData.put("action", action);
        auditData.put("targetUser", targetUser);
        auditData.put("details", details);
        
        log.info("Security Audit: {}", auditData);
    }

    /**
     * Log security configuration changes
     */
    public void logSecurityConfigChange(String adminUsername, String configType, 
                                       String oldValue, String newValue, HttpServletRequest request) {
        Map<String, Object> auditData = createBaseAuditData("SECURITY_CONFIG_CHANGE", request);
        auditData.put("adminUsername", adminUsername);
        auditData.put("configType", configType);
        auditData.put("oldValue", oldValue);
        auditData.put("newValue", newValue);
        
        log.warn("Security Audit: {}", auditData);
    }

    /**
     * Create base audit data with common fields
     */
    private Map<String, Object> createBaseAuditData(String eventType, HttpServletRequest request) {
        Map<String, Object> auditData = new HashMap<>();
        auditData.put("eventType", eventType);
        auditData.put("timestamp", LocalDateTime.now());
        
        if (request != null) {
            auditData.put("ipAddress", getClientIpAddress(request));
            auditData.put("userAgent", request.getHeader("User-Agent"));
            auditData.put("requestUri", request.getRequestURI());
            auditData.put("method", request.getMethod());
            auditData.put("sessionId", request.getSession(false) != null ? 
                         request.getSession().getId() : "none");
        }
        
        return auditData;
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
        
        return request.getRemoteAddr();
    }
}
