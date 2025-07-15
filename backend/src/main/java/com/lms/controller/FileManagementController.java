package com.lms.controller;

import com.lms.entity.FileUpload;
import com.lms.service.FileManagementService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
@Slf4j
public class FileManagementController {

    private final FileManagementService fileManagementService;

    @PostMapping("/upload")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<FileUpload> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "courseId", required = false) String courseId,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "accessLevel", defaultValue = "PRIVATE") String accessLevel,
            @RequestParam(value = "tags", required = false) String tags,
            @RequestParam(value = "expiresAt", required = false) String expiresAt,
            HttpServletRequest request) {
        
        try {
            String userId = getCurrentUserId();
            
            FileUpload.AccessLevel access = FileUpload.AccessLevel.valueOf(accessLevel.toUpperCase());
            
            LocalDateTime expiration = null;
            if (expiresAt != null && !expiresAt.trim().isEmpty()) {
                expiration = LocalDateTime.parse(expiresAt, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
            }
            
            FileUpload uploadedFile = fileManagementService.uploadFile(
                file, userId, courseId, description, access, tags, expiration, request
            );
            
            return ResponseEntity.ok(uploadedFile);
            
        } catch (IOException e) {
            log.error("File upload failed", e);
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/my-files")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<FileUpload>> getMyFiles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        String userId = getCurrentUserId();
        Pageable pageable = PageRequest.of(page, size);
        
        Page<FileUpload> files = fileManagementService.getUserFiles(userId, pageable);
        return ResponseEntity.ok(files);
    }

    @GetMapping("/course/{courseId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<FileUpload>> getCourseFiles(
            @PathVariable String courseId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<FileUpload> files = fileManagementService.getCourseFiles(courseId, pageable);
        
        return ResponseEntity.ok(files);
    }

    @GetMapping("/{fileId}/download")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Resource> downloadFile(@PathVariable String fileId) {
        try {
            String userId = getCurrentUserId();
            FileUpload file = fileManagementService.downloadFile(fileId, userId);
            
            // For Cloudinary files, redirect to the URL
            if (file.getStorageType() == FileUpload.StorageType.CLOUDINARY && file.getFileUrl() != null) {
                return ResponseEntity.status(302)
                        .header(HttpHeaders.LOCATION, file.getFileUrl())
                        .build();
            }
            
            // For local files, serve the file
            Path filePath = Paths.get(file.getFilePath());
            Resource resource = new UrlResource(filePath.toUri());
            
            if (resource.exists() && resource.isReadable()) {
                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, 
                               "attachment; filename=\"" + file.getOriginalFilename() + "\"")
                        .header(HttpHeaders.CONTENT_TYPE, file.getMimeType())
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
            
        } catch (MalformedURLException e) {
            log.error("Error creating file resource", e);
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{fileId}/info")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<FileUpload> getFileInfo(@PathVariable String fileId) {
        String userId = getCurrentUserId();
        FileUpload file = fileManagementService.downloadFile(fileId, userId);
        
        return ResponseEntity.ok(file);
    }

    @DeleteMapping("/{fileId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> deleteFile(@PathVariable String fileId) {
        String userId = getCurrentUserId();
        fileManagementService.deleteFile(fileId, userId);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "File deleted successfully");
        response.put("fileId", fileId);
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/search")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<FileUpload>> searchFiles(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<FileUpload> files = fileManagementService.searchFiles(keyword, pageable);
        
        return ResponseEntity.ok(files);
    }

    @GetMapping("/statistics")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<FileManagementService.FileStatistics> getMyFileStatistics() {
        String userId = getCurrentUserId();
        FileManagementService.FileStatistics stats = fileManagementService.getUserFileStatistics(userId);
        
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/statistics/global")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FileManagementService.FileStatistics> getGlobalFileStatistics() {
        FileManagementService.FileStatistics stats = fileManagementService.getFileStatistics();
        return ResponseEntity.ok(stats);
    }

    @PostMapping("/bulk-upload")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> bulkUpload(
            @RequestParam("files") MultipartFile[] files,
            @RequestParam(value = "courseId", required = false) String courseId,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "accessLevel", defaultValue = "PRIVATE") String accessLevel,
            @RequestParam(value = "tags", required = false) String tags,
            HttpServletRequest request) {
        
        String userId = getCurrentUserId();
        Map<String, Object> response = new HashMap<>();
        
        int successCount = 0;
        int failureCount = 0;
        
        for (MultipartFile file : files) {
            try {
                FileUpload.AccessLevel access = FileUpload.AccessLevel.valueOf(accessLevel.toUpperCase());
                
                fileManagementService.uploadFile(
                    file, userId, courseId, description, access, tags, null, request
                );
                successCount++;
                
            } catch (Exception e) {
                log.error("Failed to upload file: {}", file.getOriginalFilename(), e);
                failureCount++;
            }
        }
        
        response.put("totalFiles", files.length);
        response.put("successCount", successCount);
        response.put("failureCount", failureCount);
        response.put("message", String.format("Uploaded %d out of %d files successfully", 
                                            successCount, files.length));
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/types")
    public ResponseEntity<Map<String, Object>> getSupportedFileTypes() {
        Map<String, Object> response = new HashMap<>();
        
        Map<String, Object> fileTypes = new HashMap<>();
        fileTypes.put("images", new String[]{"jpeg", "jpg", "png", "gif", "webp", "svg"});
        fileTypes.put("videos", new String[]{"mp4", "avi", "mov", "wmv", "webm"});
        fileTypes.put("audio", new String[]{"mp3", "wav", "ogg", "m4a"});
        fileTypes.put("documents", new String[]{"pdf", "doc", "docx", "txt", "rtf"});
        fileTypes.put("presentations", new String[]{"ppt", "pptx"});
        fileTypes.put("spreadsheets", new String[]{"xls", "xlsx"});
        fileTypes.put("archives", new String[]{"zip", "rar", "7z"});
        
        response.put("supportedTypes", fileTypes);
        response.put("maxFileSize", "50MB");
        response.put("maxFilesPerUser", 100);
        response.put("maxStoragePerUser", "1GB");
        
        return ResponseEntity.ok(response);
    }

    private String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getName(); // This should be the user ID
    }
}
