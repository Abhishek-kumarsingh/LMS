package com.lms.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import javax.servlet.http.HttpServletRequest;
import javax.validation.ConstraintViolation;
import javax.validation.ConstraintViolationException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

@RestControllerAdvice
@Slf4j
public class SecurityExceptionHandler {

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<Map<String, Object>> handleAuthenticationException(
            AuthenticationException ex, HttpServletRequest request) {
        
        log.warn("Authentication failed for request to {}: {}", request.getRequestURI(), ex.getMessage());
        
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("error", "Authentication Failed");
        errorResponse.put("message", getAuthenticationErrorMessage(ex));
        errorResponse.put("status", HttpStatus.UNAUTHORIZED.value());
        errorResponse.put("timestamp", LocalDateTime.now());
        errorResponse.put("path", request.getRequestURI());
        
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDeniedException(
            AccessDeniedException ex, HttpServletRequest request) {
        
        log.warn("Access denied for request to {}: {}", request.getRequestURI(), ex.getMessage());
        
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("error", "Access Denied");
        errorResponse.put("message", "You don't have permission to access this resource");
        errorResponse.put("status", HttpStatus.FORBIDDEN.value());
        errorResponse.put("timestamp", LocalDateTime.now());
        errorResponse.put("path", request.getRequestURI());
        
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationException(
            MethodArgumentNotValidException ex, HttpServletRequest request) {
        
        log.warn("Validation failed for request to {}", request.getRequestURI());
        
        Map<String, Object> errorResponse = new HashMap<>();
        Map<String, String> fieldErrors = new HashMap<>();
        
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.put(error.getField(), error.getDefaultMessage());
        }
        
        errorResponse.put("error", "Validation Failed");
        errorResponse.put("message", "Invalid input data");
        errorResponse.put("fieldErrors", fieldErrors);
        errorResponse.put("status", HttpStatus.BAD_REQUEST.value());
        errorResponse.put("timestamp", LocalDateTime.now());
        errorResponse.put("path", request.getRequestURI());
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<Map<String, Object>> handleConstraintViolationException(
            ConstraintViolationException ex, HttpServletRequest request) {
        
        log.warn("Constraint violation for request to {}", request.getRequestURI());
        
        Map<String, Object> errorResponse = new HashMap<>();
        Map<String, String> violations = new HashMap<>();
        
        Set<ConstraintViolation<?>> constraintViolations = ex.getConstraintViolations();
        for (ConstraintViolation<?> violation : constraintViolations) {
            String propertyPath = violation.getPropertyPath().toString();
            String message = violation.getMessage();
            violations.put(propertyPath, message);
        }
        
        errorResponse.put("error", "Constraint Violation");
        errorResponse.put("message", "Input validation failed");
        errorResponse.put("violations", violations);
        errorResponse.put("status", HttpStatus.BAD_REQUEST.value());
        errorResponse.put("timestamp", LocalDateTime.now());
        errorResponse.put("path", request.getRequestURI());
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgumentException(
            IllegalArgumentException ex, HttpServletRequest request) {
        
        log.warn("Illegal argument for request to {}: {}", request.getRequestURI(), ex.getMessage());
        
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("error", "Invalid Argument");
        errorResponse.put("message", sanitizeErrorMessage(ex.getMessage()));
        errorResponse.put("status", HttpStatus.BAD_REQUEST.value());
        errorResponse.put("timestamp", LocalDateTime.now());
        errorResponse.put("path", request.getRequestURI());
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }

    @ExceptionHandler(SecurityException.class)
    public ResponseEntity<Map<String, Object>> handleSecurityException(
            SecurityException ex, HttpServletRequest request) {
        
        log.error("Security exception for request to {}: {}", request.getRequestURI(), ex.getMessage());
        
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("error", "Security Error");
        errorResponse.put("message", "A security error occurred");
        errorResponse.put("status", HttpStatus.FORBIDDEN.value());
        errorResponse.put("timestamp", LocalDateTime.now());
        errorResponse.put("path", request.getRequestURI());
        
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
    }

    private String getAuthenticationErrorMessage(AuthenticationException ex) {
        if (ex instanceof BadCredentialsException) {
            return "Invalid username or password";
        } else if (ex instanceof DisabledException) {
            return "Account is disabled";
        } else if (ex instanceof LockedException) {
            return "Account is locked";
        } else {
            return "Authentication failed";
        }
    }

    private String sanitizeErrorMessage(String message) {
        if (message == null) {
            return "An error occurred";
        }
        
        // Remove potentially sensitive information from error messages
        String sanitized = message.replaceAll("(?i)(password|token|secret|key)", "[REDACTED]");
        
        // Limit message length to prevent information disclosure
        if (sanitized.length() > 200) {
            sanitized = sanitized.substring(0, 200) + "...";
        }
        
        return sanitized;
    }
}
