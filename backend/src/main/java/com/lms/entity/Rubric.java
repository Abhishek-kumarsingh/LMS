package com.lms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "rubrics")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Rubric {
    
    @Id
    private String id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;
    
    @Column(name = "total_points", nullable = false, precision = 8, scale = 2)
    private BigDecimal totalPoints = BigDecimal.valueOf(100.0);
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String criteria; // JSON array of rubric criteria
    
    @Column(name = "is_published", nullable = false)
    private boolean isPublished = false;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Relationships
    @OneToMany(mappedBy = "rubric", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Assignment> assignments = new ArrayList<>();
}
