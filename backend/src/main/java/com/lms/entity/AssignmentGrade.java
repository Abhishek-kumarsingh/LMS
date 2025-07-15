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
@Table(name = "assignment_grades")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssignmentGrade {
    
    @Id
    private String id;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submission_id", nullable = false)
    private AssignmentSubmission submission;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignment_id", nullable = false)
    private Assignment assignment;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "grader_id", nullable = false)
    private User grader;
    
    @Column(name = "points_earned", nullable = false, precision = 8, scale = 2)
    private BigDecimal pointsEarned = BigDecimal.ZERO;
    
    @Column(name = "points_possible", nullable = false, precision = 8, scale = 2)
    private BigDecimal pointsPossible;
    
    @Column(name = "percentage", nullable = false, precision = 5, scale = 2)
    private BigDecimal percentage = BigDecimal.ZERO;
    
    @Column(name = "letter_grade")
    private String letterGrade;
    
    @Column(columnDefinition = "TEXT")
    private String feedback;
    
    @Column(name = "rubric_scores", columnDefinition = "TEXT")
    private String rubricScores; // JSON object with rubric criteria scores
    
    @Column(name = "is_excused", nullable = false)
    private boolean isExcused = false;
    
    @Column(name = "is_late", nullable = false)
    private boolean isLate = false;
    
    @Column(name = "late_penalty_applied", precision = 8, scale = 2)
    private BigDecimal latePenaltyApplied = BigDecimal.ZERO;
    
    @Column(name = "graded_at")
    private LocalDateTime gradedAt;
    
    @Column(name = "released_at")
    private LocalDateTime releasedAt;
    
    @Column(name = "is_released", nullable = false)
    private boolean isReleased = false;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "grade_status", nullable = false)
    private GradeStatus gradeStatus = GradeStatus.GRADED;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    public enum GradeStatus {
        PENDING, GRADED, NEEDS_REVIEW, RELEASED, EXCUSED
    }
}
