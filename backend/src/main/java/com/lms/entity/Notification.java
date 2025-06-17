package com.lms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Notification {
    
    @Id
    private String id;
    
    @Column(name = "user_id", nullable = false)
    private String userId;
    
    @Column(nullable = false)
    private String title;
    
    @Column(columnDefinition = "TEXT", nullable = false)
    private String message;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;
    
    @Column(name = "is_read", nullable = false)
    private boolean read = false;
    
    @Column(columnDefinition = "TEXT")
    private String metadata;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "read_at")
    private LocalDateTime readAt;
    
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
    
    // Helper methods
    public void markAsRead() {
        this.read = true;
        this.readAt = LocalDateTime.now();
    }
}
