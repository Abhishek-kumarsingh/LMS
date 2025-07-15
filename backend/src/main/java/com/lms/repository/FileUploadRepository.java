package com.lms.repository;

import com.lms.entity.FileUpload;
import com.lms.entity.User;
import com.lms.entity.Course;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface FileUploadRepository extends JpaRepository<FileUpload, String> {
    
    // Find files by uploader
    Page<FileUpload> findByUploadedByAndIsDeletedFalseOrderByCreatedAtDesc(User uploadedBy, Pageable pageable);
    
    // Find files by course
    Page<FileUpload> findByCourseAndIsDeletedFalseOrderByCreatedAtDesc(Course course, Pageable pageable);
    
    // Find files by file type
    Page<FileUpload> findByFileTypeAndIsDeletedFalseOrderByCreatedAtDesc(FileUpload.FileType fileType, Pageable pageable);
    
    // Find public files
    Page<FileUpload> findByIsPublicTrueAndIsDeletedFalseOrderByCreatedAtDesc(Pageable pageable);
    
    // Find files by access level
    Page<FileUpload> findByAccessLevelAndIsDeletedFalseOrderByCreatedAtDesc(FileUpload.AccessLevel accessLevel, Pageable pageable);
    
    // Find files by virus scan status
    List<FileUpload> findByVirusScanStatusAndIsDeletedFalse(FileUpload.VirusScanStatus status);
    
    // Find expired files
    @Query("SELECT f FROM FileUpload f WHERE f.expiresAt IS NOT NULL AND f.expiresAt < :now AND f.isDeleted = false")
    List<FileUpload> findExpiredFiles(@Param("now") LocalDateTime now);
    
    // Find files by storage type
    List<FileUpload> findByStorageTypeAndIsDeletedFalse(FileUpload.StorageType storageType);
    
    // Find files by Cloudinary public ID
    Optional<FileUpload> findByCloudinaryPublicIdAndIsDeletedFalse(String publicId);
    
    // Search files by filename or description
    @Query("SELECT f FROM FileUpload f WHERE f.isDeleted = false AND " +
           "(LOWER(f.originalFilename) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(f.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(f.tags) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "ORDER BY f.createdAt DESC")
    Page<FileUpload> searchFiles(@Param("keyword") String keyword, Pageable pageable);
    
    // Find files by user and course
    Page<FileUpload> findByUploadedByAndCourseAndIsDeletedFalseOrderByCreatedAtDesc(
        User uploadedBy, Course course, Pageable pageable);
    
    // Find files by course and file type
    Page<FileUpload> findByCourseAndFileTypeAndIsDeletedFalseOrderByCreatedAtDesc(
        Course course, FileUpload.FileType fileType, Pageable pageable);
    
    // Get file statistics
    @Query("SELECT " +
           "COUNT(f) as totalFiles, " +
           "SUM(f.fileSize) as totalSize, " +
           "SUM(f.downloadCount) as totalDownloads " +
           "FROM FileUpload f WHERE f.isDeleted = false")
    Object[] getFileStatistics();
    
    // Get file statistics by user
    @Query("SELECT " +
           "COUNT(f) as totalFiles, " +
           "SUM(f.fileSize) as totalSize, " +
           "SUM(f.downloadCount) as totalDownloads " +
           "FROM FileUpload f WHERE f.uploadedBy = :user AND f.isDeleted = false")
    Object[] getFileStatisticsByUser(@Param("user") User user);
    
    // Get file statistics by course
    @Query("SELECT " +
           "COUNT(f) as totalFiles, " +
           "SUM(f.fileSize) as totalSize, " +
           "SUM(f.downloadCount) as totalDownloads " +
           "FROM FileUpload f WHERE f.course = :course AND f.isDeleted = false")
    Object[] getFileStatisticsByCourse(@Param("course") Course course);
    
    // Find large files (over specified size)
    @Query("SELECT f FROM FileUpload f WHERE f.fileSize > :sizeBytes AND f.isDeleted = false ORDER BY f.fileSize DESC")
    List<FileUpload> findLargeFiles(@Param("sizeBytes") Long sizeBytes);
    
    // Find recently uploaded files
    @Query("SELECT f FROM FileUpload f WHERE f.createdAt >= :since AND f.isDeleted = false ORDER BY f.createdAt DESC")
    List<FileUpload> findRecentFiles(@Param("since") LocalDateTime since);
    
    // Find most downloaded files
    @Query("SELECT f FROM FileUpload f WHERE f.isDeleted = false AND f.downloadCount > 0 ORDER BY f.downloadCount DESC")
    Page<FileUpload> findMostDownloadedFiles(Pageable pageable);
    
    // Count files by type
    @Query("SELECT f.fileType, COUNT(f) FROM FileUpload f WHERE f.isDeleted = false GROUP BY f.fileType")
    List<Object[]> countFilesByType();
    
    // Count files by storage type
    @Query("SELECT f.storageType, COUNT(f) FROM FileUpload f WHERE f.isDeleted = false GROUP BY f.storageType")
    List<Object[]> countFilesByStorageType();
    
    // Find files needing virus scan
    @Query("SELECT f FROM FileUpload f WHERE f.virusScanStatus IN ('PENDING', 'FAILED') AND f.isDeleted = false ORDER BY f.createdAt ASC")
    List<FileUpload> findFilesNeedingVirusScan();
    
    // Update virus scan status
    @Modifying
    @Query("UPDATE FileUpload f SET f.virusScanStatus = :status, f.virusScanResult = :result WHERE f.id = :fileId")
    void updateVirusScanStatus(@Param("fileId") String fileId, 
                              @Param("status") FileUpload.VirusScanStatus status, 
                              @Param("result") String result);
    
    // Soft delete expired files
    @Modifying
    @Query("UPDATE FileUpload f SET f.isDeleted = true, f.deletedAt = :deletedAt WHERE f.expiresAt < :now AND f.isDeleted = false")
    void softDeleteExpiredFiles(@Param("now") LocalDateTime now, @Param("deletedAt") LocalDateTime deletedAt);
    
    // Find files by tags
    @Query("SELECT f FROM FileUpload f WHERE f.isDeleted = false AND LOWER(f.tags) LIKE LOWER(CONCAT('%', :tag, '%')) ORDER BY f.createdAt DESC")
    Page<FileUpload> findByTag(@Param("tag") String tag, Pageable pageable);
    
    // Find orphaned files (no course association)
    @Query("SELECT f FROM FileUpload f WHERE f.course IS NULL AND f.isDeleted = false ORDER BY f.createdAt DESC")
    Page<FileUpload> findOrphanedFiles(Pageable pageable);
    
    // Get storage usage by user
    @Query("SELECT SUM(f.fileSize) FROM FileUpload f WHERE f.uploadedBy = :user AND f.isDeleted = false")
    Long getStorageUsageByUser(@Param("user") User user);
    
    // Get storage usage by course
    @Query("SELECT SUM(f.fileSize) FROM FileUpload f WHERE f.course = :course AND f.isDeleted = false")
    Long getStorageUsageByCourse(@Param("course") Course course);
    
    // Find duplicate files by hash (if implemented)
    @Query("SELECT f FROM FileUpload f WHERE f.originalFilename = :filename AND f.fileSize = :fileSize AND f.isDeleted = false")
    List<FileUpload> findPotentialDuplicates(@Param("filename") String filename, @Param("fileSize") Long fileSize);
}
