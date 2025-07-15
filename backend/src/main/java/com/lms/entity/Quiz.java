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
@Table(name = "quizzes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Quiz {
    
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
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;
    
    @Column(name = "time_limit_minutes")
    private Integer timeLimitMinutes;
    
    @Column(name = "max_attempts")
    private Integer maxAttempts = 1;
    
    @Column(name = "passing_score")
    private Double passingScore;
    
    @Column(name = "total_points")
    private Double totalPoints = 0.0;
    
    @Column(name = "is_published", nullable = false)
    private boolean isPublished = false;
    
    @Column(name = "is_randomized", nullable = false)
    private boolean isRandomized = false;
    
    @Column(name = "show_results_immediately", nullable = false)
    private boolean showResultsImmediately = true;
    
    @Column(name = "show_correct_answers", nullable = false)
    private boolean showCorrectAnswers = true;
    
    @Column(name = "allow_review", nullable = false)
    private boolean allowReview = true;
    
    @Column(name = "available_from")
    private LocalDateTime availableFrom;
    
    @Column(name = "available_until")
    private LocalDateTime availableUntil;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "quiz_type", nullable = false)
    private QuizType quizType = QuizType.PRACTICE;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "grading_method", nullable = false)
    private GradingMethod gradingMethod = GradingMethod.HIGHEST_SCORE;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Question> questions = new ArrayList<>();
    
    @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<QuizAttempt> attempts = new ArrayList<>();
    
    public enum QuizType {
        PRACTICE,      // Practice quiz, doesn't count toward grade
        GRADED,        // Graded quiz, counts toward final grade
        SURVEY,        // Survey/feedback, no correct answers
        EXAM           // High-stakes exam with stricter controls
    }
    
    public enum GradingMethod {
        HIGHEST_SCORE,    // Use the highest score from all attempts
        LATEST_SCORE,     // Use the score from the latest attempt
        AVERAGE_SCORE,    // Use the average of all attempts
        FIRST_SCORE       // Use the score from the first attempt
    }
    
    // Helper methods
    public boolean isAvailable() {
        LocalDateTime now = LocalDateTime.now();
        return isPublished && 
               (availableFrom == null || now.isAfter(availableFrom)) &&
               (availableUntil == null || now.isBefore(availableUntil));
    }
    
    public boolean isExpired() {
        return availableUntil != null && LocalDateTime.now().isAfter(availableUntil);
    }
    
    public boolean hasTimeLimit() {
        return timeLimitMinutes != null && timeLimitMinutes > 0;
    }
    
    public boolean hasAttemptLimit() {
        return maxAttempts != null && maxAttempts > 0;
    }
    
    public int getQuestionCount() {
        return questions != null ? questions.size() : 0;
    }
    
    public void calculateTotalPoints() {
        if (questions != null) {
            this.totalPoints = questions.stream()
                    .mapToDouble(Question::getPoints)
                    .sum();
        }
    }
    
    public boolean canUserAttempt(User user) {
        if (!isAvailable()) {
            return false;
        }
        
        if (!hasAttemptLimit()) {
            return true;
        }
        
        long userAttempts = attempts.stream()
                .filter(attempt -> attempt.getStudent().getId().equals(user.getId()))
                .count();
        
        return userAttempts < maxAttempts;
    }
    
    public QuizAttempt getBestAttemptForUser(User user) {
        return attempts.stream()
                .filter(attempt -> attempt.getStudent().getId().equals(user.getId()))
                .filter(attempt -> attempt.getStatus() == QuizAttempt.AttemptStatus.COMPLETED)
                .max((a1, a2) -> Double.compare(a1.getScore(), a2.getScore()))
                .orElse(null);
    }
    
    public double getAverageScore() {
        return attempts.stream()
                .filter(attempt -> attempt.getStatus() == QuizAttempt.AttemptStatus.COMPLETED)
                .mapToDouble(QuizAttempt::getScore)
                .average()
                .orElse(0.0);
    }
    
    public long getCompletedAttemptCount() {
        return attempts.stream()
                .filter(attempt -> attempt.getStatus() == QuizAttempt.AttemptStatus.COMPLETED)
                .count();
    }
}
