package com.lms.service.messaging;

import com.lms.config.RabbitMQConfig;
import com.lms.dto.messaging.CertificateMessage;
import com.lms.dto.messaging.EmailMessage;
import com.lms.dto.messaging.NotificationMessage;
import com.lms.entity.Certificate;
import com.lms.entity.Course;
import com.lms.entity.Enrollment;
import com.lms.entity.User;
import com.lms.repository.CertificateRepository;
import com.lms.repository.CourseRepository;
import com.lms.repository.EnrollmentRepository;
import com.lms.repository.UserRepository;
import com.lms.service.PdfCertificateGeneratorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CertificateConsumerService {

    private final CertificateRepository certificateRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final PdfCertificateGeneratorService pdfGeneratorService;
    private final MessageProducerService messageProducerService;

    @Value("${app.certificate.base-url:http://localhost:8080/certificates}")
    private String certificateBaseUrl;

    @RabbitListener(queues = RabbitMQConfig.CERTIFICATE_QUEUE)
    public void processCertificateMessage(CertificateMessage certificateMessage) {
        try {
            log.info("Processing certificate generation for enrollment: {}", 
                    certificateMessage.getEnrollmentId());
            
            // Get enrollment and validate
            Enrollment enrollment = enrollmentRepository.findById(certificateMessage.getEnrollmentId())
                    .orElseThrow(() -> new RuntimeException("Enrollment not found"));
            
            if (!enrollment.isCompleted()) {
                log.warn("Enrollment {} is not completed, skipping certificate generation", 
                        enrollment.getId());
                return;
            }
            
            // Check if certificate already exists
            if (certificateRepository.existsByEnrollment(enrollment)) {
                log.warn("Certificate already exists for enrollment {}", enrollment.getId());
                return;
            }
            
            // Create certificate record
            Certificate certificate = createCertificateRecord(enrollment);
            
            // Generate PDF
            generateCertificatePdf(certificate);
            
            // Send notifications
            sendCertificateNotifications(certificate);
            
            log.info("Certificate generated successfully for enrollment: {}", 
                    certificateMessage.getEnrollmentId());
            
        } catch (Exception e) {
            log.error("Failed to process certificate message: {}", 
                    certificateMessage.getId(), e);
            handleCertificateFailure(certificateMessage, e);
        }
    }
    
    private Certificate createCertificateRecord(Enrollment enrollment) {
        Certificate certificate = new Certificate();
        certificate.setId(UUID.randomUUID().toString());
        certificate.setUser(enrollment.getUser());
        certificate.setCourse(enrollment.getCourse());
        certificate.setEnrollment(enrollment);
        certificate.setCertificateNumber(generateCertificateNumber());
        certificate.setStatus(Certificate.Status.PENDING);
        
        return certificateRepository.save(certificate);
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
    
    private void sendCertificateNotifications(Certificate certificate) {
        try {
            // Send email notification
            sendCertificateEmail(certificate);
            
            // Send in-app notification
            sendCertificateNotification(certificate);
            
        } catch (Exception e) {
            log.error("Failed to send certificate notifications", e);
            // Don't fail the entire process if notifications fail
        }
    }
    
    private void sendCertificateEmail(Certificate certificate) {
        Map<String, Object> emailData = new HashMap<>();
        emailData.put("studentName", certificate.getUser().getFullName());
        emailData.put("courseName", certificate.getCourse().getTitle());
        emailData.put("certificateNumber", certificate.getCertificateNumber());
        emailData.put("instructorName", certificate.getCourse().getInstructor().getFullName());
        emailData.put("completionDate", certificate.getEnrollment().getCompletedAt()
                .format(DateTimeFormatter.ofPattern("MMMM dd, yyyy")));
        
        EmailMessage emailMessage = new EmailMessage(
                certificate.getUser().getEmail(),
                "Your Certificate is Ready!",
                EmailMessage.EmailType.CERTIFICATE_READY,
                emailData
        );
        
        messageProducerService.sendEmailMessage(emailMessage);
    }
    
    private void sendCertificateNotification(Certificate certificate) {
        String title = "Certificate Ready!";
        String message = String.format("Your certificate for '%s' is now ready for download.",
                certificate.getCourse().getTitle());
        
        Map<String, Object> notificationData = new HashMap<>();
        notificationData.put("certificateId", certificate.getId());
        notificationData.put("courseId", certificate.getCourse().getId());
        notificationData.put("certificateNumber", certificate.getCertificateNumber());
        
        NotificationMessage notificationMessage = new NotificationMessage(
                certificate.getUser().getId(),
                title,
                message,
                NotificationMessage.NotificationType.CERTIFICATE_READY,
                notificationData
        );
        
        messageProducerService.sendNotificationMessage(notificationMessage);
    }
    
    private String generateCertificateNumber() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String randomPart = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        return "CERT-" + timestamp + "-" + randomPart;
    }
    
    private void handleCertificateFailure(CertificateMessage certificateMessage, Exception e) {
        certificateMessage.setRetryCount(certificateMessage.getRetryCount() + 1);
        
        if (certificateMessage.getRetryCount() < 3) {
            log.info("Retrying certificate generation: {} (attempt {})", 
                    certificateMessage.getId(), certificateMessage.getRetryCount());
            // Could re-queue the message for retry
        } else {
            log.error("Certificate generation failed after {} attempts: {}", 
                    certificateMessage.getRetryCount(), certificateMessage.getId());
            // Could send to dead letter queue or alert admins
        }
    }
}
