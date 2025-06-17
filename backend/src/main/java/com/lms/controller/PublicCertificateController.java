package com.lms.controller;

import com.lms.entity.Certificate;
import com.lms.service.CertificateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/public/certificates")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class PublicCertificateController {

    private final CertificateService certificateService;

    @GetMapping("/verify/{certificateNumber}")
    public ResponseEntity<Map<String, Object>> verifyCertificate(@PathVariable String certificateNumber) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Certificate certificate = certificateService.getCertificateByNumber(certificateNumber);
            
            if (certificate != null && certificate.isGenerated()) {
                response.put("valid", true);
                response.put("certificateNumber", certificate.getCertificateNumber());
                response.put("studentName", certificate.getUser().getFullName());
                response.put("courseName", certificate.getCourse().getTitle());
                response.put("instructorName", certificate.getCourse().getInstructor().getFullName());
                response.put("issueDate", certificate.getIssuedAt());
                response.put("completionDate", certificate.getEnrollment().getCompletedAt());
                response.put("courseDuration", certificate.getCourse().getDurationMinutes());
            } else {
                response.put("valid", false);
                response.put("message", "Certificate not found or not valid");
            }
        } catch (Exception e) {
            response.put("valid", false);
            response.put("message", "Certificate not found");
        }
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/verify-simple/{certificateNumber}")
    public ResponseEntity<Map<String, Boolean>> verifyCertificateSimple(@PathVariable String certificateNumber) {
        boolean isValid = certificateService.verifyCertificate(certificateNumber);
        Map<String, Boolean> response = new HashMap<>();
        response.put("valid", isValid);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/certificate-info/{certificateNumber}")
    public ResponseEntity<Map<String, Object>> getCertificateInfo(@PathVariable String certificateNumber) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Certificate certificate = certificateService.getCertificateByNumber(certificateNumber);
            
            if (certificate != null && certificate.isGenerated()) {
                response.put("exists", true);
                response.put("certificateNumber", certificate.getCertificateNumber());
                response.put("studentName", certificate.getUser().getFullName());
                response.put("courseName", certificate.getCourse().getTitle());
                response.put("instructorName", certificate.getCourse().getInstructor().getFullName());
                response.put("issueDate", certificate.getIssuedAt());
                response.put("completionDate", certificate.getEnrollment().getCompletedAt());
                
                // Course information
                Map<String, Object> courseInfo = new HashMap<>();
                courseInfo.put("title", certificate.getCourse().getTitle());
                courseInfo.put("description", certificate.getCourse().getDescription());
                courseInfo.put("duration", certificate.getCourse().getDurationMinutes());
                courseInfo.put("level", certificate.getCourse().getLevel());
                courseInfo.put("category", certificate.getCourse().getCategory().getName());
                response.put("courseInfo", courseInfo);
                
                // Instructor information
                Map<String, Object> instructorInfo = new HashMap<>();
                instructorInfo.put("name", certificate.getCourse().getInstructor().getFullName());
                instructorInfo.put("email", certificate.getCourse().getInstructor().getEmail());
                response.put("instructorInfo", instructorInfo);
                
                // Certificate statistics (without sensitive data)
                response.put("downloadCount", certificate.getDownloadCount());
                response.put("status", certificate.getStatus().toString());
            } else {
                response.put("exists", false);
                response.put("message", "Certificate not found or not available");
            }
        } catch (Exception e) {
            response.put("exists", false);
            response.put("message", "Certificate not found");
        }
        
        return ResponseEntity.ok(response);
    }
}
