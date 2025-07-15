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
@Table(name = "questions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Question {
    
    @Id
    private String id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;
    
    @Column(name = "question_text", columnDefinition = "TEXT", nullable = false)
    private String questionText;
    
    @Column(name = "question_html", columnDefinition = "TEXT")
    private String questionHtml; // Rich text version
    
    @Enumerated(EnumType.STRING)
    @Column(name = "question_type", nullable = false)
    private QuestionType questionType;
    
    @Column(name = "points", nullable = false)
    private Double points = 1.0;
    
    @Column(name = "order_index", nullable = false)
    private Integer orderIndex;
    
    @Column(name = "explanation", columnDefinition = "TEXT")
    private String explanation; // Explanation shown after answering
    
    @Column(name = "image_url")
    private String imageUrl;
    
    @Column(name = "video_url")
    private String videoUrl;
    
    @Column(name = "audio_url")
    private String audioUrl;
    
    @Column(name = "is_required", nullable = false)
    private boolean isRequired = true;
    
    @Column(name = "time_limit_seconds")
    private Integer timeLimitSeconds;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @OrderBy("orderIndex ASC")
    private List<QuestionOption> options = new ArrayList<>();
    
    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<QuestionAnswer> answers = new ArrayList<>();
    
    public enum QuestionType {
        MULTIPLE_CHOICE,        // Single correct answer from multiple options
        MULTIPLE_SELECT,        // Multiple correct answers from multiple options
        TRUE_FALSE,            // True or False question
        SHORT_ANSWER,          // Short text answer
        ESSAY,                 // Long text answer
        FILL_IN_BLANK,         // Fill in the blank(s)
        MATCHING,              // Match items from two lists
        ORDERING,              // Put items in correct order
        NUMERICAL,             // Numerical answer with tolerance
        FILE_UPLOAD,           // Upload a file as answer
        DRAG_AND_DROP,         // Drag and drop interface
        HOTSPOT               // Click on image hotspots
    }
    
    // Helper methods
    public boolean hasOptions() {
        return questionType == QuestionType.MULTIPLE_CHOICE ||
               questionType == QuestionType.MULTIPLE_SELECT ||
               questionType == QuestionType.TRUE_FALSE ||
               questionType == QuestionType.MATCHING ||
               questionType == QuestionType.ORDERING;
    }
    
    public boolean isTextBased() {
        return questionType == QuestionType.SHORT_ANSWER ||
               questionType == QuestionType.ESSAY ||
               questionType == QuestionType.FILL_IN_BLANK;
    }
    
    public boolean requiresManualGrading() {
        return questionType == QuestionType.ESSAY ||
               questionType == QuestionType.FILE_UPLOAD ||
               (questionType == QuestionType.SHORT_ANSWER && !hasAutoGradingPattern());
    }
    
    public boolean hasAutoGradingPattern() {
        // Check if there are predefined correct answers for auto-grading
        return options.stream().anyMatch(QuestionOption::isCorrect);
    }
    
    public List<QuestionOption> getCorrectOptions() {
        return options.stream()
                .filter(QuestionOption::isCorrect)
                .toList();
    }
    
    public boolean isSingleChoice() {
        return questionType == QuestionType.MULTIPLE_CHOICE ||
               questionType == QuestionType.TRUE_FALSE;
    }
    
    public boolean isMultipleChoice() {
        return questionType == QuestionType.MULTIPLE_SELECT;
    }
    
    public boolean hasTimeLimit() {
        return timeLimitSeconds != null && timeLimitSeconds > 0;
    }
    
    public boolean hasMedia() {
        return imageUrl != null || videoUrl != null || audioUrl != null;
    }
    
    public double calculateScore(List<String> userAnswers) {
        if (requiresManualGrading()) {
            return 0.0; // Manual grading required
        }
        
        switch (questionType) {
            case MULTIPLE_CHOICE:
            case TRUE_FALSE:
                return calculateSingleChoiceScore(userAnswers);
            case MULTIPLE_SELECT:
                return calculateMultipleChoiceScore(userAnswers);
            case NUMERICAL:
                return calculateNumericalScore(userAnswers);
            default:
                return 0.0;
        }
    }
    
    private double calculateSingleChoiceScore(List<String> userAnswers) {
        if (userAnswers.isEmpty()) return 0.0;
        
        String userAnswer = userAnswers.get(0);
        return options.stream()
                .filter(option -> option.getId().equals(userAnswer))
                .findFirst()
                .map(option -> option.isCorrect() ? points : 0.0)
                .orElse(0.0);
    }
    
    private double calculateMultipleChoiceScore(List<String> userAnswers) {
        List<QuestionOption> correctOptions = getCorrectOptions();
        if (correctOptions.isEmpty()) return 0.0;
        
        // All or nothing scoring for multiple select
        boolean allCorrect = correctOptions.stream()
                .allMatch(option -> userAnswers.contains(option.getId()));
        
        boolean noIncorrect = userAnswers.stream()
                .allMatch(answerId -> correctOptions.stream()
                        .anyMatch(option -> option.getId().equals(answerId)));
        
        return (allCorrect && noIncorrect) ? points : 0.0;
    }
    
    private double calculateNumericalScore(List<String> userAnswers) {
        if (userAnswers.isEmpty()) return 0.0;
        
        try {
            double userValue = Double.parseDouble(userAnswers.get(0));
            // Implementation would need tolerance checking
            // For now, exact match
            return options.stream()
                    .filter(QuestionOption::isCorrect)
                    .anyMatch(option -> {
                        try {
                            return Math.abs(Double.parseDouble(option.getOptionText()) - userValue) < 0.001;
                        } catch (NumberFormatException e) {
                            return false;
                        }
                    }) ? points : 0.0;
        } catch (NumberFormatException e) {
            return 0.0;
        }
    }
}
