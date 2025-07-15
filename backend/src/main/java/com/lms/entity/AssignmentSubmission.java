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
@Table(name = "assignment_submissions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssignmentSubmission {
    
    @Id
    private String id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignment_id", nullable = false)
    private Assignment assignment;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;
    
    @Column(name = "group_id")
    private String groupId;
    
    @Column(name = "submission_text", columnDefinition = "TEXT")
    private String submissionText;
    
    @Column(name = "submission_files", columnDefinition = "TEXT")
    private String submissionFiles; // JSON array of file URLs
    
    @Column(name = "submission_metadata", columnDefinition = "TEXT")
    private String submissionMetadata; // JSON for additional data
    
    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;
    
    @Column(name = "is_late", nullable = false)
    private boolean isLate = false;
    
    @Column(name = "attempt_number", nullable = false)
    private Integer attemptNumber = 1;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SubmissionStatus status = SubmissionStatus.SUBMITTED;
    
    @Column(name = "plagiarism_score", precision = 5, scale = 2)
    private BigDecimal plagiarismScore;
    
    @Column(name = "plagiarism_report_url")
    private String plagiarismReportUrl;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Relationship to grade
    @OneToOne(mappedBy = "submission", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private AssignmentGrade grade;
    
    public enum SubmissionStatus {
        DRAFT, SUBMITTED, GRADED, RETURNED, RESUBMITTED
    }
}
