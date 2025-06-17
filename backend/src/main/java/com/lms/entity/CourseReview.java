package com.lms.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "course_reviews")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourseReview {
    
    @Id
    private String id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;
    
    @Column(nullable = false)
    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating must be at most 5")
    private Integer rating;
    
    @Column(length = 255)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String content;
    
    @Column(name = "is_published", nullable = false)
    private boolean isPublished = true;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Helper methods
    public boolean hasContent() {
        return content != null && !content.trim().isEmpty();
    }
    
    public boolean hasTitle() {
        return title != null && !title.trim().isEmpty();
    }
}
