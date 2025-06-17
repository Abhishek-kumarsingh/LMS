package com.lms.service;

import com.lms.entity.Certificate;
import com.lms.entity.Course;
import com.lms.entity.Enrollment;
import com.lms.entity.User;
import com.lms.exception.BadRequestException;
import com.lms.exception.ResourceNotFoundException;
import com.lms.repository.CertificateRepository;
import com.lms.repository.CourseRepository;
import com.lms.repository.EnrollmentRepository;
import com.lms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CertificateService {

    private final CertificateRepository certificateRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final PdfCertificateGeneratorService pdfGeneratorService;

    @Value("${app.certificate.base-url:http://localhost:8080/certificates}")
    private String certificateBaseUrl;

    public Certificate generateCertificate(String enrollmentId) {
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment not found"));

        User currentUser = getCurrentUser();

        // Check if user owns this enrollment
        if (!enrollment.getUser().getId().equals(currentUser.getId())) {
            throw new BadRequestException("You can only generate certificates for your own enrollments");
        }

        // Check if course is completed
        if (!enrollment.isCompleted()) {
            throw new BadRequestException("Course must be completed to generate certificate");
        }

        // Check if certificate already exists
        if (certificateRepository.existsByEnrollment(enrollment)) {
            throw new BadRequestException("Certificate already exists for this enrollment");
        }

        // Create certificate record
        Certificate certificate = new Certificate();
        certificate.setId(UUID.randomUUID().toString());
        certificate.setUser(enrollment.getUser());
        certificate.setCourse(enrollment.getCourse());
        certificate.setEnrollment(enrollment);
        certificate.setCertificateNumber(generateCertificateNumber());
        certificate.setStatus(Certificate.Status.PENDING);

        Certificate savedCertificate = certificateRepository.save(certificate);

        // Generate PDF asynchronously
        try {
            generateCertificatePdf(savedCertificate);
        } catch (Exception e) {
            log.error("Failed to generate certificate PDF for enrollment {}", enrollmentId, e);
            savedCertificate.setStatus(Certificate.Status.FAILED);
            certificateRepository.save(savedCertificate);
            throw new BadRequestException("Failed to generate certificate PDF");
        }

        log.info("Certificate generated for user {} and course {}", 
                currentUser.getEmail(), enrollment.getCourse().getTitle());

        return savedCertificate;
    }

    private void generateCertificatePdf(Certificate certificate) {
        try {
            String fileName = "certificate_" + certificate.getCertificateNumber() + ".pdf";
            String filePath = pdfGeneratorService.generateCertificate(certificate, fileName);
            
            certificate.setFilePath(filePath);
            certificate.setFileUrl(certificateBaseUrl + "/" + fileName);
            certificate.setStatus(Certificate.Status.GENERATED);
            
            certificateRepository.save(certificate);
            
            log.info("Certificate PDF generated successfully: {}", fileName);
        } catch (Exception e) {
            log.error("Failed to generate certificate PDF", e);
            certificate.setStatus(Certificate.Status.FAILED);
            certificateRepository.save(certificate);
            throw new RuntimeException("Failed to generate certificate PDF", e);
        }
    }

    @Transactional(readOnly = true)
    public Certificate getCertificateById(String certificateId) {
        return certificateRepository.findById(certificateId)
                .orElseThrow(() -> new ResourceNotFoundException("Certificate not found"));
    }

    @Transactional(readOnly = true)
    public Certificate getCertificateByNumber(String certificateNumber) {
        return certificateRepository.findByCertificateNumber(certificateNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Certificate not found"));
    }

    @Transactional(readOnly = true)
    public Certificate getUserCertificateForCourse(String courseId) {
        User currentUser = getCurrentUser();
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        return certificateRepository.findByUserAndCourse(currentUser, course)
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public Page<Certificate> getUserCertificates(Pageable pageable) {
        User currentUser = getCurrentUser();
        return certificateRepository.findByUserOrderByIssuedAtDesc(currentUser, pageable);
    }

    @Transactional(readOnly = true)
    public Page<Certificate> getCourseCertificates(String courseId, Pageable pageable) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        
        User currentUser = getCurrentUser();
        
        // Check if user is instructor or admin
        if (!currentUser.isAdmin() && !course.getInstructor().getId().equals(currentUser.getId())) {
            throw new BadRequestException("You can only view certificates for your own courses");
        }

        return certificateRepository.findByCourseOrderByIssuedAtDesc(course, pageable);
    }

    @Transactional(readOnly = true)
    public Page<Certificate> getInstructorCertificates(Pageable pageable) {
        User currentUser = getCurrentUser();
        
        if (!currentUser.isInstructor() && !currentUser.isAdmin()) {
            throw new BadRequestException("Only instructors can view their course certificates");
        }

        return certificateRepository.findByInstructor(currentUser, pageable);
    }

    @Transactional(readOnly = true)
    public long getUserCertificateCount() {
        User currentUser = getCurrentUser();
        return certificateRepository.countByUser(currentUser);
    }

    @Transactional(readOnly = true)
    public Object[] getInstructorCertificateStats() {
        User currentUser = getCurrentUser();
        
        if (!currentUser.isInstructor() && !currentUser.isAdmin()) {
            throw new BadRequestException("Only instructors can view certificate statistics");
        }

        return certificateRepository.getInstructorCertificateStats(currentUser);
    }

    public Certificate downloadCertificate(String certificateId) {
        Certificate certificate = getCertificateById(certificateId);
        User currentUser = getCurrentUser();

        // Check permissions
        if (!currentUser.isAdmin() && !certificate.getUser().getId().equals(currentUser.getId())) {
            throw new BadRequestException("You can only download your own certificates");
        }

        // Check if certificate is generated
        if (!certificate.isGenerated()) {
            throw new BadRequestException("Certificate is not ready for download");
        }

        // Update download statistics
        certificate.markAsDownloaded();
        Certificate savedCertificate = certificateRepository.save(certificate);

        log.info("Certificate downloaded: {} by user {}", 
                certificate.getCertificateNumber(), currentUser.getEmail());

        return savedCertificate;
    }

    @Transactional(readOnly = true)
    public boolean verifyCertificate(String certificateNumber) {
        return certificateRepository.findByCertificateNumber(certificateNumber)
                .map(certificate -> certificate.getStatus() == Certificate.Status.GENERATED)
                .orElse(false);
    }

    @Transactional(readOnly = true)
    public Page<Certificate> getCertificatesByStatus(Certificate.Status status, Pageable pageable) {
        User currentUser = getCurrentUser();
        
        if (!currentUser.isAdmin()) {
            throw new BadRequestException("Only admins can view certificates by status");
        }

        return certificateRepository.findByStatusOrderByIssuedAtDesc(status, pageable);
    }

    public void regenerateCertificate(String certificateId) {
        Certificate certificate = getCertificateById(certificateId);
        User currentUser = getCurrentUser();

        // Check permissions
        if (!currentUser.isAdmin() && !certificate.getUser().getId().equals(currentUser.getId())) {
            throw new BadRequestException("You can only regenerate your own certificates");
        }

        certificate.setStatus(Certificate.Status.PENDING);
        certificate.setDownloadCount(0);
        certificate.setDownloadedAt(null);
        
        Certificate savedCertificate = certificateRepository.save(certificate);

        // Regenerate PDF
        try {
            generateCertificatePdf(savedCertificate);
        } catch (Exception e) {
            log.error("Failed to regenerate certificate PDF for certificate {}", certificateId, e);
            throw new BadRequestException("Failed to regenerate certificate PDF");
        }

        log.info("Certificate regenerated: {} by user {}", 
                certificate.getCertificateNumber(), currentUser.getEmail());
    }

    public void processPendingCertificates() {
        List<Certificate> pendingCertificates = certificateRepository.findByStatusOrderByIssuedAtAsc(Certificate.Status.PENDING);
        
        for (Certificate certificate : pendingCertificates) {
            try {
                generateCertificatePdf(certificate);
            } catch (Exception e) {
                log.error("Failed to process pending certificate {}", certificate.getId(), e);
            }
        }
    }

    private String generateCertificateNumber() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String randomPart = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        return "CERT-" + timestamp + "-" + randomPart;
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
