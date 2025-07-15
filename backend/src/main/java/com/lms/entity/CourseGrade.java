package com.lms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "course_grades")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourseGrade {
    
    @Id
    private String id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;
    
    @Column(name = "current_grade", precision = 5, scale = 2)
    private BigDecimal currentGrade = BigDecimal.ZERO;
    
    @Column(name = "final_grade", precision = 5, scale = 2)
    private BigDecimal finalGrade;
    
    @Column(name = "letter_grade")
    private String letterGrade;
    
    @Column(name = "grade_points", precision = 3, scale = 2)
    private BigDecimal gradePoints;
    
    @Column(name = "is_passing", nullable = false)
    private boolean isPassing = false;
    
    @Column(name = "is_complete", nullable = false)
    private boolean isComplete = false;
    
    @Column(name = "completion_date")
    private LocalDateTime completionDate;
    
    @Column(name = "grade_locked", nullable = false)
    private boolean gradeLocked = false;
    
    @Column(name = "override_grade", precision = 5, scale = 2)
    private BigDecimal overrideGrade;
    
    @Column(name = "override_reason", columnDefinition = "TEXT")
    private String overrideReason;
    
    @Column(name = "last_calculated")
    private LocalDateTime lastCalculated;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
