package com.lms.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Entity
@Table(name = "question_answers")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuestionAnswer {
    
    @Id
    private String id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_attempt_id", nullable = false)
    private QuizAttempt quizAttempt;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;
    
    @Column(name = "selected_options", columnDefinition = "TEXT")
    private String selectedOptions; // Comma-separated option IDs
    
    @Column(name = "text_answer", columnDefinition = "TEXT")
    private String textAnswer;
    
    @Column(name = "file_upload_url")
    private String fileUploadUrl;
    
    @Column(name = "points_earned")
    private Double pointsEarned;
    
    @Column(name = "is_correct")
    private Boolean isCorrect;
    
    @Column(name = "is_graded", nullable = false)
    private boolean isGraded = false;
    
    @Column(name = "grader_feedback", columnDefinition = "TEXT")
    private String graderFeedback;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "graded_by")
    private User gradedBy;
    
    @Column(name = "graded_at")
    private LocalDateTime gradedAt;
    
    @Column(name = "time_spent_seconds")
    private Integer timeSpentSeconds;
    
    @Column(name = "answer_order")
    private String answerOrder; // For ordering questions
    
    @Column(name = "matching_pairs", columnDefinition = "TEXT")
    private String matchingPairs; // For matching questions (JSON format)
    
    @Column(name = "numerical_answer")
    private Double numericalAnswer;
    
    @Column(name = "is_flagged", nullable = false)
    private boolean isFlagged = false; // Flagged for review
    
    @Column(name = "flag_reason")
    private String flagReason;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Helper methods
    public boolean hasAnswer() {
        return (selectedOptions != null && !selectedOptions.trim().isEmpty()) ||
               (textAnswer != null && !textAnswer.trim().isEmpty()) ||
               (fileUploadUrl != null && !fileUploadUrl.trim().isEmpty()) ||
               (numericalAnswer != null);
    }
    
    public List<String> getSelectedOptionsList() {
        if (selectedOptions == null || selectedOptions.trim().isEmpty()) {
            return List.of();
        }
        return Arrays.asList(selectedOptions.split(","));
    }
    
    public void setSelectedOptionsList(List<String> options) {
        if (options == null || options.isEmpty()) {
            this.selectedOptions = null;
        } else {
            this.selectedOptions = String.join(",", options);
        }
    }
    
    public boolean requiresManualGrading() {
        return question.requiresManualGrading();
    }
    
    public void autoGrade() {
        if (requiresManualGrading()) {
            return; // Cannot auto-grade
        }
        
        List<String> userAnswers = getSelectedOptionsList();
        if (numericalAnswer != null) {
            userAnswers = List.of(numericalAnswer.toString());
        } else if (textAnswer != null && !textAnswer.trim().isEmpty()) {
            userAnswers = List.of(textAnswer.trim());
        }
        
        this.pointsEarned = question.calculateScore(userAnswers);
        this.isCorrect = pointsEarned > 0;
        this.isGraded = true;
        this.gradedAt = LocalDateTime.now();
    }
    
    public void manualGrade(double points, boolean correct, String feedback, User grader) {
        this.pointsEarned = points;
        this.isCorrect = correct;
        this.graderFeedback = feedback;
        this.gradedBy = grader;
        this.isGraded = true;
        this.gradedAt = LocalDateTime.now();
    }
    
    public boolean isMultipleChoice() {
        return question.getQuestionType() == Question.QuestionType.MULTIPLE_CHOICE ||
               question.getQuestionType() == Question.QuestionType.MULTIPLE_SELECT ||
               question.getQuestionType() == Question.QuestionType.TRUE_FALSE;
    }
    
    public boolean isTextBased() {
        return question.getQuestionType() == Question.QuestionType.SHORT_ANSWER ||
               question.getQuestionType() == Question.QuestionType.ESSAY ||
               question.getQuestionType() == Question.QuestionType.FILL_IN_BLANK;
    }
    
    public boolean isNumerical() {
        return question.getQuestionType() == Question.QuestionType.NUMERICAL;
    }
    
    public boolean isFileUpload() {
        return question.getQuestionType() == Question.QuestionType.FILE_UPLOAD;
    }
    
    public double getPercentageScore() {
        if (pointsEarned == null || question.getPoints() == 0) {
            return 0.0;
        }
        return (pointsEarned / question.getPoints()) * 100.0;
    }
    
    public void flag(String reason) {
        this.isFlagged = true;
        this.flagReason = reason;
    }
    
    public void unflag() {
        this.isFlagged = false;
        this.flagReason = null;
    }
    
    public String getDisplayAnswer() {
        if (isMultipleChoice() && selectedOptions != null) {
            return selectedOptions;
        } else if (isTextBased() && textAnswer != null) {
            return textAnswer;
        } else if (isNumerical() && numericalAnswer != null) {
            return numericalAnswer.toString();
        } else if (isFileUpload() && fileUploadUrl != null) {
            return "File uploaded: " + fileUploadUrl;
        }
        return "No answer provided";
    }
}
