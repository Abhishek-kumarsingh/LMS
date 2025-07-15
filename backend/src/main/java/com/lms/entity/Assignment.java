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
@Table(name = "assignments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Assignment {
    
    @Id
    private String id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(columnDefinition = "TEXT")
    private String instructions;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id")
    private Lesson lesson;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "assignment_type", nullable = false)
    private AssignmentType assignmentType = AssignmentType.ESSAY;
    
    @Column(name = "max_points", nullable = false, precision = 8, scale = 2)
    private BigDecimal maxPoints = BigDecimal.valueOf(100.0);
    
    @Column(name = "due_date")
    private LocalDateTime dueDate;
    
    @Column(name = "available_from")
    private LocalDateTime availableFrom;
    
    @Column(name = "available_until")
    private LocalDateTime availableUntil;
    
    @Column(name = "allow_late_submission", nullable = false)
    private boolean allowLateSubmission = false;
    
    @Column(name = "late_penalty_percentage", precision = 5, scale = 2)
    private BigDecimal latePenaltyPercentage = BigDecimal.ZERO;
    
    @Column(name = "max_attempts")
    private Integer maxAttempts = 1;
    
    @Column(name = "time_limit_minutes")
    private Integer timeLimitMinutes;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "submission_format", nullable = false)
    private SubmissionFormat submissionFormat = SubmissionFormat.TEXT;
    
    @Column(name = "required_files", columnDefinition = "TEXT")
    private String requiredFiles; // JSON array of required file types
    
    @Column(name = "max_file_size_mb")
    private Integer maxFileSizeMb = 10;
    
    @Column(name = "auto_grade", nullable = false)
    private boolean autoGrade = false;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rubric_id")
    private Rubric rubric;
    
    @Column(name = "is_published", nullable = false)
    private boolean isPublished = false;
    
    @Column(name = "is_group_assignment", nullable = false)
    private boolean isGroupAssignment = false;
    
    @Column(name = "max_group_size")
    private Integer maxGroupSize = 1;
    
    @Column(name = "peer_review_enabled", nullable = false)
    private boolean peerReviewEnabled = false;
    
    @Column(name = "peer_review_count")
    private Integer peerReviewCount = 0;
    
    @Column(name = "show_rubric_to_students", nullable = false)
    private boolean showRubricToStudents = true;
    
    @Column(name = "plagiarism_check_enabled", nullable = false)
    private boolean plagiarismCheckEnabled = false;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "gradebook_category_id")
    private GradebookCategory gradebookCategory;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Relationships
    @OneToMany(mappedBy = "assignment", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<AssignmentSubmission> submissions = new ArrayList<>();
    
    @OneToMany(mappedBy = "assignment", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<AssignmentGrade> grades = new ArrayList<>();
    
    public enum AssignmentType {
        ESSAY, MULTIPLE_CHOICE, FILE_UPLOAD, PRESENTATION, PROJECT, DISCUSSION, PEER_REVIEW
    }
    
    public enum SubmissionFormat {
        TEXT, FILE, URL, MEDIA, CODE
    }
}
