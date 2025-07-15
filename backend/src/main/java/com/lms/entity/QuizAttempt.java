package com.lms.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "quiz_attempts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizAttempt {
    
    @Id
    private String id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;
    
    @Column(name = "attempt_number", nullable = false)
    private Integer attemptNumber;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private AttemptStatus status = AttemptStatus.IN_PROGRESS;
    
    @Column(name = "score")
    private Double score;
    
    @Column(name = "percentage_score")
    private Double percentageScore;
    
    @Column(name = "total_points")
    private Double totalPoints;
    
    @Column(name = "earned_points")
    private Double earnedPoints;
    
    @Column(name = "time_spent_minutes")
    private Integer timeSpentMinutes;
    
    @Column(name = "started_at")
    private LocalDateTime startedAt;
    
    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;
    
    @Column(name = "graded_at")
    private LocalDateTime gradedAt;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "graded_by")
    private User gradedBy;
    
    @Column(name = "feedback", columnDefinition = "TEXT")
    private String feedback;
    
    @Column(name = "ip_address")
    private String ipAddress;
    
    @Column(name = "user_agent", columnDefinition = "TEXT")
    private String userAgent;
    
    @Column(name = "is_late_submission", nullable = false)
    private boolean isLateSubmission = false;
    
    @Column(name = "auto_submitted", nullable = false)
    private boolean autoSubmitted = false; // True if submitted due to time limit
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "quizAttempt", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<QuestionAnswer> answers = new ArrayList<>();
    
    public enum AttemptStatus {
        IN_PROGRESS,    // Student is currently taking the quiz
        SUBMITTED,      // Student has submitted, waiting for grading
        COMPLETED,      // Fully graded and complete
        ABANDONED,      // Student left without submitting
        EXPIRED,        // Time limit exceeded
        FLAGGED         // Flagged for review (potential cheating)
    }
    
    // Helper methods
    public boolean isCompleted() {
        return status == AttemptStatus.COMPLETED;
    }
    
    public boolean isInProgress() {
        return status == AttemptStatus.IN_PROGRESS;
    }
    
    public boolean needsGrading() {
        return status == AttemptStatus.SUBMITTED;
    }
    
    public boolean isPassed() {
        if (!isCompleted() || quiz.getPassingScore() == null) {
            return false;
        }
        return percentageScore != null && percentageScore >= quiz.getPassingScore();
    }
    
    public void calculateScore() {
        if (answers.isEmpty()) {
            this.earnedPoints = 0.0;
            this.score = 0.0;
            this.percentageScore = 0.0;
            return;
        }
        
        this.earnedPoints = answers.stream()
                .mapToDouble(answer -> answer.getPointsEarned() != null ? answer.getPointsEarned() : 0.0)
                .sum();
        
        this.totalPoints = quiz.getTotalPoints();
        this.score = earnedPoints;
        
        if (totalPoints > 0) {
            this.percentageScore = (earnedPoints / totalPoints) * 100.0;
        } else {
            this.percentageScore = 0.0;
        }
    }
    
    public void submit() {
        this.status = AttemptStatus.SUBMITTED;
        this.submittedAt = LocalDateTime.now();
        
        // Check if late submission
        if (quiz.getAvailableUntil() != null && submittedAt.isAfter(quiz.getAvailableUntil())) {
            this.isLateSubmission = true;
        }
        
        // Auto-grade if possible
        autoGrade();
    }
    
    public void autoGrade() {
        boolean needsManualGrading = false;
        
        for (QuestionAnswer answer : answers) {
            if (answer.getQuestion().requiresManualGrading()) {
                needsManualGrading = true;
            } else {
                // Auto-grade this answer
                answer.autoGrade();
            }
        }
        
        calculateScore();
        
        if (!needsManualGrading) {
            this.status = AttemptStatus.COMPLETED;
            this.gradedAt = LocalDateTime.now();
        }
    }
    
    public void completeGrading(User grader, String feedback) {
        this.status = AttemptStatus.COMPLETED;
        this.gradedAt = LocalDateTime.now();
        this.gradedBy = grader;
        this.feedback = feedback;
        
        calculateScore();
    }
    
    public int getTimeSpentInMinutes() {
        if (startedAt == null) return 0;
        
        LocalDateTime endTime = submittedAt != null ? submittedAt : LocalDateTime.now();
        return (int) java.time.Duration.between(startedAt, endTime).toMinutes();
    }
    
    public boolean isTimeExpired() {
        if (!quiz.hasTimeLimit() || startedAt == null) {
            return false;
        }
        
        LocalDateTime timeLimit = startedAt.plusMinutes(quiz.getTimeLimitMinutes());
        return LocalDateTime.now().isAfter(timeLimit);
    }
    
    public int getRemainingTimeInMinutes() {
        if (!quiz.hasTimeLimit() || startedAt == null) {
            return Integer.MAX_VALUE;
        }
        
        LocalDateTime timeLimit = startedAt.plusMinutes(quiz.getTimeLimitMinutes());
        LocalDateTime now = LocalDateTime.now();
        
        if (now.isAfter(timeLimit)) {
            return 0;
        }
        
        return (int) java.time.Duration.between(now, timeLimit).toMinutes();
    }
    
    public double getCompletionPercentage() {
        if (quiz.getQuestionCount() == 0) return 0.0;
        
        long answeredQuestions = answers.stream()
                .filter(answer -> answer.hasAnswer())
                .count();
        
        return (double) answeredQuestions / quiz.getQuestionCount() * 100.0;
    }
}
