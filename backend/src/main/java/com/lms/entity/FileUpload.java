package com.lms.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "file_uploads")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FileUpload {
    
    @Id
    private String id;
    
    @Column(name = "original_filename", nullable = false)
    private String originalFilename;
    
    @Column(name = "stored_filename", nullable = false)
    private String storedFilename;
    
    @Column(name = "file_path", nullable = false)
    private String filePath;
    
    @Column(name = "file_url")
    private String fileUrl;
    
    @Column(name = "file_size", nullable = false)
    private Long fileSize;
    
    @Column(name = "mime_type", nullable = false)
    private String mimeType;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "file_type", nullable = false)
    private FileType fileType;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "storage_type", nullable = false)
    private StorageType storageType;
    
    @Column(name = "cloudinary_public_id")
    private String cloudinaryPublicId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by", nullable = false)
    private User uploadedBy;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id")
    private Course course;
    
    @Column(name = "description")
    private String description;
    
    @Column(name = "is_public", nullable = false)
    private boolean isPublic = false;
    
    @Column(name = "download_count", nullable = false)
    private Long downloadCount = 0L;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "expires_at")
    private LocalDateTime expiresAt;
    
    @Column(name = "is_deleted", nullable = false)
    private boolean isDeleted = false;
    
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
    
    @Column(name = "virus_scan_status")
    @Enumerated(EnumType.STRING)
    private VirusScanStatus virusScanStatus = VirusScanStatus.PENDING;
    
    @Column(name = "virus_scan_result")
    private String virusScanResult;
    
    @Column(name = "access_level")
    @Enumerated(EnumType.STRING)
    private AccessLevel accessLevel = AccessLevel.PRIVATE;
    
    @Column(name = "tags")
    private String tags; // Comma-separated tags
    
    public enum FileType {
        IMAGE,
        VIDEO,
        AUDIO,
        DOCUMENT,
        PRESENTATION,
        SPREADSHEET,
        PDF,
        ARCHIVE,
        CODE,
        OTHER
    }
    
    public enum StorageType {
        CLOUDINARY,
        LOCAL,
        AWS_S3,
        GOOGLE_CLOUD
    }
    
    public enum VirusScanStatus {
        PENDING,
        SCANNING,
        CLEAN,
        INFECTED,
        FAILED
    }
    
    public enum AccessLevel {
        PRIVATE,      // Only uploader can access
        COURSE,       // Course participants can access
        INSTRUCTOR,   // Course instructor and uploader can access
        PUBLIC        // Anyone can access
    }
    
    // Helper methods
    public void incrementDownloadCount() {
        this.downloadCount++;
    }
    
    public void markAsDeleted() {
        this.isDeleted = true;
        this.deletedAt = LocalDateTime.now();
    }
    
    public boolean isExpired() {
        return expiresAt != null && LocalDateTime.now().isAfter(expiresAt);
    }
    
    public boolean isImage() {
        return fileType == FileType.IMAGE;
    }
    
    public boolean isVideo() {
        return fileType == FileType.VIDEO;
    }
    
    public boolean isDocument() {
        return fileType == FileType.DOCUMENT || 
               fileType == FileType.PDF || 
               fileType == FileType.PRESENTATION || 
               fileType == FileType.SPREADSHEET;
    }
    
    public String getFileExtension() {
        if (originalFilename != null && originalFilename.contains(".")) {
            return originalFilename.substring(originalFilename.lastIndexOf(".") + 1).toLowerCase();
        }
        return "";
    }
    
    public String getFormattedFileSize() {
        if (fileSize == null) return "0 B";
        
        long bytes = fileSize;
        if (bytes < 1024) return bytes + " B";
        
        int exp = (int) (Math.log(bytes) / Math.log(1024));
        String pre = "KMGTPE".charAt(exp - 1) + "";
        return String.format("%.1f %sB", bytes / Math.pow(1024, exp), pre);
    }
    
    public boolean canBeAccessedBy(User user) {
        if (isDeleted || isExpired()) {
            return false;
        }
        
        if (virusScanStatus == VirusScanStatus.INFECTED) {
            return false;
        }
        
        // Uploader can always access
        if (uploadedBy.getId().equals(user.getId())) {
            return true;
        }
        
        // Admin can access everything
        if (user.isAdmin()) {
            return true;
        }
        
        return switch (accessLevel) {
            case PUBLIC -> true;
            case COURSE -> course != null && isUserEnrolledInCourse(user);
            case INSTRUCTOR -> course != null && 
                              (course.getInstructor().getId().equals(user.getId()) || 
                               isUserEnrolledInCourse(user));
            case PRIVATE -> false;
        };
    }
    
    private boolean isUserEnrolledInCourse(User user) {
        // This would need to be implemented with enrollment check
        // For now, return false - should be implemented in service layer
        return false;
    }
}
