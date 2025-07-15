package com.lms.service;

import com.lms.entity.*;
import com.lms.exception.BadRequestException;
import com.lms.exception.ResourceNotFoundException;
import com.lms.repository.FileUploadRepository;
import com.lms.repository.UserRepository;
import com.lms.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class FileManagementService {

    private final FileUploadRepository fileUploadRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final CloudinaryService cloudinaryService;
    private final RateLimitService rateLimitService;
    private final SecurityAuditService securityAuditService;

    @Value("${file.max-size:52428800}") // 50MB default
    private long maxFileSize;

    @Value("${file.max-files-per-user:100}")
    private int maxFilesPerUser;

    @Value("${file.max-storage-per-user:1073741824}") // 1GB default
    private long maxStoragePerUser;

    // Allowed file types and their MIME types
    private static final Map<String, Set<String>> ALLOWED_FILE_TYPES = Map.of(
        "image", Set.of("image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"),
        "video", Set.of("video/mp4", "video/avi", "video/mov", "video/wmv", "video/webm"),
        "audio", Set.of("audio/mp3", "audio/wav", "audio/ogg", "audio/m4a"),
        "document", Set.of("application/pdf", "application/msword", 
                          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                          "text/plain", "text/rtf"),
        "presentation", Set.of("application/vnd.ms-powerpoint",
                              "application/vnd.openxmlformats-officedocument.presentationml.presentation"),
        "spreadsheet", Set.of("application/vnd.ms-excel",
                             "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"),
        "archive", Set.of("application/zip", "application/x-rar-compressed", "application/x-7z-compressed")
    );

    /**
     * Upload a file with comprehensive validation and metadata
     */
    @Transactional
    public FileUpload uploadFile(MultipartFile file, String userId, String courseId, 
                               String description, FileUpload.AccessLevel accessLevel,
                               String tags, LocalDateTime expiresAt, HttpServletRequest request) throws IOException {
        
        // Rate limiting check
        if (!rateLimitService.checkUploadRateLimit(userId, request)) {
            throw new BadRequestException("Upload rate limit exceeded");
        }

        // Validate file
        validateFile(file, userId);

        User uploader = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Course course = null;
        if (courseId != null) {
            course = courseRepository.findById(courseId)
                    .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        }

        // Determine file type
        FileUpload.FileType fileType = determineFileType(file.getContentType());
        
        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String fileExtension = getFileExtension(originalFilename);
        String storedFilename = UUID.randomUUID().toString() + "." + fileExtension;

        // Upload to appropriate storage
        FileUpload fileUpload = new FileUpload();
        fileUpload.setId(UUID.randomUUID().toString());
        fileUpload.setOriginalFilename(originalFilename);
        fileUpload.setStoredFilename(storedFilename);
        fileUpload.setFileSize(file.getSize());
        fileUpload.setMimeType(file.getContentType());
        fileUpload.setFileType(fileType);
        fileUpload.setUploadedBy(uploader);
        fileUpload.setCourse(course);
        fileUpload.setDescription(description);
        fileUpload.setAccessLevel(accessLevel != null ? accessLevel : FileUpload.AccessLevel.PRIVATE);
        fileUpload.setTags(tags);
        fileUpload.setExpiresAt(expiresAt);

        // Upload to Cloudinary for images and videos
        if (fileType == FileUpload.FileType.IMAGE || fileType == FileUpload.FileType.VIDEO) {
            try {
                String folder = course != null ? "courses/" + course.getId() : "general";
                String cloudinaryUrl;
                
                if (fileType == FileUpload.FileType.IMAGE) {
                    cloudinaryUrl = cloudinaryService.uploadImage(file, folder);
                } else {
                    cloudinaryUrl = cloudinaryService.uploadVideo(file, folder);
                }
                
                fileUpload.setFileUrl(cloudinaryUrl);
                fileUpload.setStorageType(FileUpload.StorageType.CLOUDINARY);
                fileUpload.setCloudinaryPublicId(extractPublicIdFromUrl(cloudinaryUrl));
                
            } catch (IOException e) {
                log.error("Failed to upload to Cloudinary, falling back to local storage", e);
                // Fall back to local storage
                uploadToLocalStorage(file, fileUpload);
            }
        } else {
            // Upload documents and other files to local storage
            uploadToLocalStorage(file, fileUpload);
        }

        FileUpload savedFile = fileUploadRepository.save(fileUpload);

        // Log the upload
        securityAuditService.logFileUpload(
            uploader.getEmail(),
            originalFilename,
            file.getSize(),
            file.getContentType(),
            true,
            request
        );

        log.info("File uploaded successfully: {} by user {}", originalFilename, userId);
        return savedFile;
    }

    /**
     * Get files for a user
     */
    public Page<FileUpload> getUserFiles(String userId, Pageable pageable) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        return fileUploadRepository.findByUploadedByAndIsDeletedFalseOrderByCreatedAtDesc(user, pageable);
    }

    /**
     * Get files for a course
     */
    public Page<FileUpload> getCourseFiles(String courseId, Pageable pageable) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        
        return fileUploadRepository.findByCourseAndIsDeletedFalseOrderByCreatedAtDesc(course, pageable);
    }

    /**
     * Download a file
     */
    @Transactional
    public FileUpload downloadFile(String fileId, String userId) {
        FileUpload file = fileUploadRepository.findById(fileId)
                .orElseThrow(() -> new ResourceNotFoundException("File not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Check access permissions
        if (!file.canBeAccessedBy(user)) {
            throw new BadRequestException("Access denied to this file");
        }

        // Check if file is expired or deleted
        if (file.isDeleted() || file.isExpired()) {
            throw new BadRequestException("File is no longer available");
        }

        // Check virus scan status
        if (file.getVirusScanStatus() == FileUpload.VirusScanStatus.INFECTED) {
            throw new BadRequestException("File failed security scan");
        }

        // Increment download count
        file.incrementDownloadCount();
        fileUploadRepository.save(file);

        log.info("File downloaded: {} by user {}", file.getOriginalFilename(), userId);
        return file;
    }

    /**
     * Delete a file
     */
    @Transactional
    public void deleteFile(String fileId, String userId) {
        FileUpload file = fileUploadRepository.findById(fileId)
                .orElseThrow(() -> new ResourceNotFoundException("File not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Check permissions (only uploader or admin can delete)
        if (!file.getUploadedBy().getId().equals(userId) && !user.isAdmin()) {
            throw new BadRequestException("You can only delete your own files");
        }

        // Soft delete
        file.markAsDeleted();
        fileUploadRepository.save(file);

        // Delete from storage
        deleteFromStorage(file);

        log.info("File deleted: {} by user {}", file.getOriginalFilename(), userId);
    }

    /**
     * Search files
     */
    public Page<FileUpload> searchFiles(String keyword, Pageable pageable) {
        return fileUploadRepository.searchFiles(keyword, pageable);
    }

    /**
     * Get file statistics
     */
    public FileStatistics getFileStatistics() {
        Object[] stats = fileUploadRepository.getFileStatistics();
        return new FileStatistics(
            ((Number) stats[0]).longValue(),
            ((Number) stats[1]).longValue(),
            ((Number) stats[2]).longValue()
        );
    }

    /**
     * Get user file statistics
     */
    public FileStatistics getUserFileStatistics(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        Object[] stats = fileUploadRepository.getFileStatisticsByUser(user);
        return new FileStatistics(
            ((Number) stats[0]).longValue(),
            ((Number) stats[1]).longValue(),
            ((Number) stats[2]).longValue()
        );
    }

    /**
     * Clean up expired files (scheduled task)
     */
    @Scheduled(fixedRate = 3600000) // Run every hour
    @Transactional
    public void cleanupExpiredFiles() {
        LocalDateTime now = LocalDateTime.now();
        List<FileUpload> expiredFiles = fileUploadRepository.findExpiredFiles(now);
        
        if (!expiredFiles.isEmpty()) {
            fileUploadRepository.softDeleteExpiredFiles(now, now);
            
            // Delete from storage
            for (FileUpload file : expiredFiles) {
                deleteFromStorage(file);
            }
            
            log.info("Cleaned up {} expired files", expiredFiles.size());
        }
    }

    // Private helper methods
    private void validateFile(MultipartFile file, String userId) {
        if (file.isEmpty()) {
            throw new BadRequestException("Please select a file to upload");
        }

        if (file.getSize() > maxFileSize) {
            throw new BadRequestException("File size exceeds maximum allowed size of " + 
                                        formatFileSize(maxFileSize));
        }

        // Check file type
        String contentType = file.getContentType();
        if (!isAllowedFileType(contentType)) {
            throw new BadRequestException("File type not allowed: " + contentType);
        }

        // Check user limits
        checkUserLimits(userId, file.getSize());
    }

    private void checkUserLimits(String userId, long fileSize) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Check file count limit
        long userFileCount = fileUploadRepository.findByUploadedByAndIsDeletedFalseOrderByCreatedAtDesc(
            user, org.springframework.data.domain.Pageable.unpaged()).getTotalElements();
        
        if (userFileCount >= maxFilesPerUser) {
            throw new BadRequestException("Maximum number of files exceeded (" + maxFilesPerUser + ")");
        }

        // Check storage limit
        Long currentUsage = fileUploadRepository.getStorageUsageByUser(user);
        if (currentUsage != null && (currentUsage + fileSize) > maxStoragePerUser) {
            throw new BadRequestException("Storage quota exceeded. Current usage: " + 
                                        formatFileSize(currentUsage) + ", Limit: " + 
                                        formatFileSize(maxStoragePerUser));
        }
    }

    private boolean isAllowedFileType(String contentType) {
        return ALLOWED_FILE_TYPES.values().stream()
                .anyMatch(types -> types.contains(contentType));
    }

    private FileUpload.FileType determineFileType(String contentType) {
        for (Map.Entry<String, Set<String>> entry : ALLOWED_FILE_TYPES.entrySet()) {
            if (entry.getValue().contains(contentType)) {
                return switch (entry.getKey()) {
                    case "image" -> FileUpload.FileType.IMAGE;
                    case "video" -> FileUpload.FileType.VIDEO;
                    case "audio" -> FileUpload.FileType.AUDIO;
                    case "document" -> FileUpload.FileType.DOCUMENT;
                    case "presentation" -> FileUpload.FileType.PRESENTATION;
                    case "spreadsheet" -> FileUpload.FileType.SPREADSHEET;
                    case "archive" -> FileUpload.FileType.ARCHIVE;
                    default -> FileUpload.FileType.OTHER;
                };
            }
        }
        return FileUpload.FileType.OTHER;
    }

    private String getFileExtension(String filename) {
        if (filename != null && filename.contains(".")) {
            return filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
        }
        return "";
    }

    private void uploadToLocalStorage(MultipartFile file, FileUpload fileUpload) throws IOException {
        // Implementation for local storage upload
        // This would save the file to local filesystem
        fileUpload.setStorageType(FileUpload.StorageType.LOCAL);
        fileUpload.setFilePath("/uploads/" + fileUpload.getStoredFilename());
        fileUpload.setFileUrl("/api/files/" + fileUpload.getId() + "/download");
    }

    private void deleteFromStorage(FileUpload file) {
        if (file.getStorageType() == FileUpload.StorageType.CLOUDINARY && 
            file.getCloudinaryPublicId() != null) {
            cloudinaryService.deleteFile(file.getCloudinaryPublicId());
        }
        // Add local storage deletion logic here
    }

    private String extractPublicIdFromUrl(String url) {
        return cloudinaryService.extractPublicIdFromUrl(url);
    }

    private String formatFileSize(long bytes) {
        if (bytes < 1024) return bytes + " B";
        int exp = (int) (Math.log(bytes) / Math.log(1024));
        String pre = "KMGTPE".charAt(exp - 1) + "";
        return String.format("%.1f %sB", bytes / Math.pow(1024, exp), pre);
    }

    // Statistics class
    public static class FileStatistics {
        private final long totalFiles;
        private final long totalSize;
        private final long totalDownloads;

        public FileStatistics(long totalFiles, long totalSize, long totalDownloads) {
            this.totalFiles = totalFiles;
            this.totalSize = totalSize;
            this.totalDownloads = totalDownloads;
        }

        public long getTotalFiles() { return totalFiles; }
        public long getTotalSize() { return totalSize; }
        public long getTotalDownloads() { return totalDownloads; }
    }
}
