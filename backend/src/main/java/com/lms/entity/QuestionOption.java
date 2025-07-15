package com.lms.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;

@Entity
@Table(name = "question_options")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuestionOption {
    
    @Id
    private String id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;
    
    @Column(name = "option_text", columnDefinition = "TEXT", nullable = false)
    private String optionText;
    
    @Column(name = "option_html", columnDefinition = "TEXT")
    private String optionHtml; // Rich text version
    
    @Column(name = "is_correct", nullable = false)
    private boolean isCorrect = false;
    
    @Column(name = "order_index", nullable = false)
    private Integer orderIndex;
    
    @Column(name = "image_url")
    private String imageUrl;
    
    @Column(name = "explanation", columnDefinition = "TEXT")
    private String explanation; // Explanation for why this option is correct/incorrect
    
    @Column(name = "points_if_selected")
    private Double pointsIfSelected; // Partial credit for this option
    
    // Helper methods
    public boolean hasImage() {
        return imageUrl != null && !imageUrl.trim().isEmpty();
    }
    
    public boolean hasExplanation() {
        return explanation != null && !explanation.trim().isEmpty();
    }
    
    public double getPointValue() {
        return pointsIfSelected != null ? pointsIfSelected : (isCorrect ? 1.0 : 0.0);
    }
}
