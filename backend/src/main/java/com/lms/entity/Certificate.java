package com.lms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "certificates")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Certificate {
    
    @Id
    private String id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "enrollment_id", nullable = false)
    private Enrollment enrollment;
    
    @Column(name = "certificate_number", unique = true, nullable = false)
    private String certificateNumber;
    
    @Column(name = "file_path")
    private String filePath;
    
    @Column(name = "file_url")
    private String fileUrl;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.PENDING;
    
    @CreationTimestamp
    @Column(name = "issued_at")
    private LocalDateTime issuedAt;
    
    @Column(name = "downloaded_at")
    private LocalDateTime downloadedAt;
    
    @Column(name = "download_count", nullable = false)
    private Integer downloadCount = 0;
    
    public enum Status {
        PENDING, GENERATED, FAILED
    }
    
    // Helper methods
    public boolean isGenerated() {
        return status == Status.GENERATED && fileUrl != null;
    }
    
    public void markAsDownloaded() {
        this.downloadedAt = LocalDateTime.now();
        this.downloadCount++;
    }
}
