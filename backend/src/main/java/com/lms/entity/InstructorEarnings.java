package com.lms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "instructor_earnings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InstructorEarnings {
    
    @Id
    private String id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "instructor_id", nullable = false)
    private User instructor;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "enrollment_id", nullable = false)
    private Enrollment enrollment;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;
    
    @Column(name = "commission_rate", nullable = false, precision = 5, scale = 2)
    private BigDecimal commissionRate = new BigDecimal("70.00"); // 70% to instructor
    
    @Column(name = "platform_fee", nullable = false, precision = 10, scale = 2)
    private BigDecimal platformFee;
    
    @Column(name = "net_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal netAmount;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.PENDING;
    
    @CreationTimestamp
    @Column(name = "earned_at")
    private LocalDateTime earnedAt;
    
    @Column(name = "paid_at")
    private LocalDateTime paidAt;
    
    public enum Status {
        PENDING, PAID, CANCELLED
    }
    
    // Helper methods
    public void calculateEarnings() {
        this.platformFee = amount.multiply(BigDecimal.ONE.subtract(commissionRate.divide(new BigDecimal("100"))));
        this.netAmount = amount.subtract(platformFee);
    }
    
    public boolean isPaid() {
        return status == Status.PAID && paidAt != null;
    }
}
