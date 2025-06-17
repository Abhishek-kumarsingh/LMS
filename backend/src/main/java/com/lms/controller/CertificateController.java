package com.lms.controller;

import com.lms.entity.Certificate;
import com.lms.service.CertificateService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/certificates")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class CertificateController {

    private final CertificateService certificateService;

    @PostMapping("/enrollments/{enrollmentId}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Certificate> generateCertificate(@PathVariable String enrollmentId) {
        Certificate certificate = certificateService.generateCertificate(enrollmentId);
        return ResponseEntity.ok(certificate);
    }

    @GetMapping("/{certificateId}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Certificate> getCertificate(@PathVariable String certificateId) {
        Certificate certificate = certificateService.getCertificateById(certificateId);
        return ResponseEntity.ok(certificate);
    }

    @GetMapping("/number/{certificateNumber}")
    public ResponseEntity<Certificate> getCertificateByNumber(@PathVariable String certificateNumber) {
        Certificate certificate = certificateService.getCertificateByNumber(certificateNumber);
        return ResponseEntity.ok(certificate);
    }

    @GetMapping("/courses/{courseId}/my-certificate")
    @PreAuthorize("hasRole('STUDENT') or hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Certificate> getUserCertificateForCourse(@PathVariable String courseId) {
        Certificate certificate = certificateService.getUserCertificateForCourse(courseId);
        if (certificate != null) {
            return ResponseEntity.ok(certificate);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/my-certificates")
    @PreAuthorize("hasRole('STUDENT') or hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Page<Certificate>> getUserCertificates(@PageableDefault(size = 12) Pageable pageable) {
        Page<Certificate> certificates = certificateService.getUserCertificates(pageable);
        return ResponseEntity.ok(certificates);
    }

    @GetMapping("/courses/{courseId}/certificates")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Page<Certificate>> getCourseCertificates(@PathVariable String courseId,
                                                                 @PageableDefault(size = 12) Pageable pageable) {
        Page<Certificate> certificates = certificateService.getCourseCertificates(courseId, pageable);
        return ResponseEntity.ok(certificates);
    }

    @GetMapping("/instructor/certificates")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Page<Certificate>> getInstructorCertificates(@PageableDefault(size = 12) Pageable pageable) {
        Page<Certificate> certificates = certificateService.getInstructorCertificates(pageable);
        return ResponseEntity.ok(certificates);
    }

    @GetMapping("/my-certificates/count")
    @PreAuthorize("hasRole('STUDENT') or hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Long> getUserCertificateCount() {
        long count = certificateService.getUserCertificateCount();
        return ResponseEntity.ok(count);
    }

    @GetMapping("/instructor/stats")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Object[]> getInstructorCertificateStats() {
        Object[] stats = certificateService.getInstructorCertificateStats();
        return ResponseEntity.ok(stats);
    }

    @PostMapping("/{certificateId}/download")
    @PreAuthorize("hasRole('STUDENT') or hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Certificate> downloadCertificate(@PathVariable String certificateId) {
        Certificate certificate = certificateService.downloadCertificate(certificateId);
        return ResponseEntity.ok(certificate);
    }

    @GetMapping("/{certificateId}/download-file")
    @PreAuthorize("hasRole('STUDENT') or hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Resource> downloadCertificateFile(@PathVariable String certificateId) {
        Certificate certificate = certificateService.downloadCertificate(certificateId);

        try {
            Path filePath = Paths.get(certificate.getFilePath());
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION,
                               "attachment; filename=\"certificate_" + certificate.getCertificateNumber() + ".pdf\"")
                        .header(HttpHeaders.CONTENT_TYPE, "application/pdf")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/verify/{certificateNumber}")
    public ResponseEntity<Boolean> verifyCertificate(@PathVariable String certificateNumber) {
        boolean isValid = certificateService.verifyCertificate(certificateNumber);
        return ResponseEntity.ok(isValid);
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<Certificate>> getCertificatesByStatus(@PathVariable Certificate.Status status,
                                                                   @PageableDefault(size = 12) Pageable pageable) {
        Page<Certificate> certificates = certificateService.getCertificatesByStatus(status, pageable);
        return ResponseEntity.ok(certificates);
    }

    @PostMapping("/{certificateId}/regenerate")
    @PreAuthorize("hasRole('STUDENT') or hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Void> regenerateCertificate(@PathVariable String certificateId) {
        certificateService.regenerateCertificate(certificateId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/process-pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> processPendingCertificates() {
        certificateService.processPendingCertificates();
        return ResponseEntity.noContent().build();
    }
}
