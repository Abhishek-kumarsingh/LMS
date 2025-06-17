package com.lms.controller;

import com.lms.entity.Certificate;
import com.lms.entity.Course;
import com.lms.entity.Enrollment;
import com.lms.entity.User;
import com.lms.service.PdfCertificateGeneratorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/test/certificates")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class CertificateTestController {

    private final PdfCertificateGeneratorService pdfGeneratorService;

    @PostMapping("/generate-sample")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> generateSampleCertificate() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Create sample data
            Certificate sampleCertificate = createSampleCertificate();
            
            // Generate PDF
            String fileName = "sample_certificate_" + System.currentTimeMillis() + ".pdf";
            String filePath = pdfGeneratorService.generateCertificate(sampleCertificate, fileName);
            
            response.put("success", true);
            response.put("message", "Sample certificate generated successfully");
            response.put("filePath", filePath);
            response.put("fileName", fileName);
            response.put("certificateNumber", sampleCertificate.getCertificateNumber());
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to generate sample certificate: " + e.getMessage());
            response.put("error", e.getClass().getSimpleName());
        }
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/template-test")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> testTemplate() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Certificate sampleCertificate = createSampleCertificate();
            
            response.put("success", true);
            response.put("message", "Template data prepared successfully");
            response.put("sampleData", Map.of(
                "studentName", sampleCertificate.getUser().getFullName(),
                "courseName", sampleCertificate.getCourse().getTitle(),
                "instructorName", sampleCertificate.getCourse().getInstructor().getFullName(),
                "certificateNumber", sampleCertificate.getCertificateNumber(),
                "issueDate", sampleCertificate.getIssuedAt().format(DateTimeFormatter.ofPattern("MMMM dd, yyyy")),
                "completionDate", sampleCertificate.getEnrollment().getCompletedAt().format(DateTimeFormatter.ofPattern("MMMM dd, yyyy"))
            ));
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to prepare template data: " + e.getMessage());
            response.put("error", e.getClass().getSimpleName());
        }
        
        return ResponseEntity.ok(response);
    }

    private Certificate createSampleCertificate() {
        // Create sample user
        User sampleUser = new User();
        sampleUser.setId(UUID.randomUUID().toString());
        sampleUser.setFirstName("John");
        sampleUser.setLastName("Doe");
        sampleUser.setEmail("john.doe@example.com");
        
        // Create sample instructor
        User sampleInstructor = new User();
        sampleInstructor.setId(UUID.randomUUID().toString());
        sampleInstructor.setFirstName("Jane");
        sampleInstructor.setLastName("Smith");
        sampleInstructor.setEmail("jane.smith@example.com");
        
        // Create sample course
        Course sampleCourse = new Course();
        sampleCourse.setId(UUID.randomUUID().toString());
        sampleCourse.setTitle("Introduction to Modern Web Development");
        sampleCourse.setDescription("A comprehensive course covering modern web development technologies");
        sampleCourse.setDurationMinutes(1200); // 20 hours
        sampleCourse.setInstructor(sampleInstructor);
        
        // Create sample enrollment
        Enrollment sampleEnrollment = new Enrollment();
        sampleEnrollment.setId(UUID.randomUUID().toString());
        sampleEnrollment.setUser(sampleUser);
        sampleEnrollment.setCourse(sampleCourse);
        sampleEnrollment.setCompleted(true);
        sampleEnrollment.setCompletedAt(LocalDateTime.now().minusDays(1));
        sampleEnrollment.setEnrolledAt(LocalDateTime.now().minusDays(30));
        
        // Create sample certificate
        Certificate sampleCertificate = new Certificate();
        sampleCertificate.setId(UUID.randomUUID().toString());
        sampleCertificate.setUser(sampleUser);
        sampleCertificate.setCourse(sampleCourse);
        sampleCertificate.setEnrollment(sampleEnrollment);
        sampleCertificate.setCertificateNumber(generateSampleCertificateNumber());
        sampleCertificate.setStatus(Certificate.Status.PENDING);
        sampleCertificate.setIssuedAt(LocalDateTime.now());
        
        return sampleCertificate;
    }
    
    private String generateSampleCertificateNumber() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String randomPart = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        return "CERT-SAMPLE-" + timestamp + "-" + randomPart;
    }
}
