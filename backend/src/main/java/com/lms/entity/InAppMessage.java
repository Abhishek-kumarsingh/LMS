package com.lms.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "in_app_messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InAppMessage {
    
    @Id
    private String id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id")
    private User sender;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id", nullable = false)
    private User recipient;
    
    @Column(nullable = false)
    private String subject;
    
    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MessageType type;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Priority priority = Priority.NORMAL;
    
    @Column(name = "is_read", nullable = false)
    private boolean isRead = false;
    
    @Column(name = "read_at")
    private LocalDateTime readAt;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "expires_at")
    private LocalDateTime expiresAt;
    
    @Column(name = "action_url")
    private String actionUrl;
    
    @Column(name = "action_text")
    private String actionText;
    
    @ElementCollection
    @CollectionTable(name = "message_metadata", joinColumns = @JoinColumn(name = "message_id"))
    @MapKeyColumn(name = "metadata_key")
    @Column(name = "metadata_value")
    private Map<String, String> metadata;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "related_course_id")
    private Course relatedCourse;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "related_enrollment_id")
    private Enrollment relatedEnrollment;
    
    public enum MessageType {
        SYSTEM_ANNOUNCEMENT,
        COURSE_UPDATE,
        ENROLLMENT_CONFIRMATION,
        ASSIGNMENT_DUE,
        GRADE_POSTED,
        CERTIFICATE_READY,
        INSTRUCTOR_MESSAGE,
        ADMIN_MESSAGE,
        COURSE_REMINDER,
        PAYMENT_CONFIRMATION,
        SECURITY_ALERT,
        WELCOME_MESSAGE,
        ACHIEVEMENT_UNLOCKED
    }
    
    public enum Priority {
        LOW,
        NORMAL,
        HIGH,
        URGENT
    }
    
    // Helper methods
    public void markAsRead() {
        this.isRead = true;
        this.readAt = LocalDateTime.now();
    }
    
    public boolean isExpired() {
        return expiresAt != null && LocalDateTime.now().isAfter(expiresAt);
    }
    
    public boolean hasAction() {
        return actionUrl != null && !actionUrl.trim().isEmpty();
    }
}
