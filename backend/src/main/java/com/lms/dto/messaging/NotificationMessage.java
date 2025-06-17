package com.lms.dto.messaging;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationMessage {
    
    private String id;
    private String userId;
    private String title;
    private String message;
    private NotificationType type;
    private Map<String, Object> data;
    private LocalDateTime createdAt;
    private boolean read;
    
    public enum NotificationType {
        COURSE_ENROLLMENT,
        COURSE_COMPLETION,
        CERTIFICATE_READY,
        NEW_COURSE_PUBLISHED,
        COURSE_UPDATED,
        REVIEW_RECEIVED,
        COMMENT_RECEIVED,
        INSTRUCTOR_APPROVED,
        SYSTEM_ANNOUNCEMENT
    }
    
    public NotificationMessage(String userId, String title, String message, NotificationType type) {
        this.userId = userId;
        this.title = title;
        this.message = message;
        this.type = type;
        this.createdAt = LocalDateTime.now();
        this.read = false;
    }
    
    public NotificationMessage(String userId, String title, String message, NotificationType type, Map<String, Object> data) {
        this(userId, title, message, type);
        this.data = data;
    }
}
