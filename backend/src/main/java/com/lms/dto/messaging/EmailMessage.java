package com.lms.dto.messaging;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmailMessage {
    
    private String id;
    private String to;
    private String from;
    private String subject;
    private String templateName;
    private Map<String, Object> templateData;
    private EmailType type;
    private LocalDateTime createdAt;
    private int retryCount;
    
    public enum EmailType {
        WELCOME,
        ENROLLMENT_CONFIRMATION,
        COURSE_PUBLISHED,
        CERTIFICATE_READY,
        INSTRUCTOR_APPROVED,
        INSTRUCTOR_REJECTED,
        PASSWORD_RESET,
        COURSE_REMINDER,
        ENROLLMENT_REMINDER
    }
    
    public EmailMessage(String to, String subject, EmailType type, Map<String, Object> templateData) {
        this.to = to;
        this.subject = subject;
        this.type = type;
        this.templateData = templateData;
        this.createdAt = LocalDateTime.now();
        this.retryCount = 0;
    }
}
