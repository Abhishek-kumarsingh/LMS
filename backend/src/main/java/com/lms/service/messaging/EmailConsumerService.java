package com.lms.service.messaging;

import com.lms.config.RabbitMQConfig;
import com.lms.dto.messaging.EmailMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.util.Locale;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailConsumerService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${cors.allowed-origins}")
    private String frontendUrl;

    @RabbitListener(queues = RabbitMQConfig.EMAIL_QUEUE)
    public void processEmailMessage(EmailMessage emailMessage) {
        try {
            log.info("Processing email message: {} for {}", emailMessage.getType(), emailMessage.getTo());
            
            String emailContent = generateEmailContent(emailMessage);
            sendEmail(emailMessage.getTo(), emailMessage.getSubject(), emailContent);
            
            log.info("Email sent successfully: {} to {}", emailMessage.getType(), emailMessage.getTo());
        } catch (Exception e) {
            log.error("Failed to process email message: {}", emailMessage.getId(), e);
            handleEmailFailure(emailMessage, e);
        }
    }

    private String generateEmailContent(EmailMessage emailMessage) {
        if (emailMessage.getTemplateName() != null) {
            // Use Thymeleaf template if specified
            Context context = new Context(Locale.ENGLISH);
            if (emailMessage.getTemplateData() != null) {
                emailMessage.getTemplateData().forEach(context::setVariable);
            }
            context.setVariable("frontendUrl", frontendUrl.split(",")[0]);
            return templateEngine.process(emailMessage.getTemplateName(), context);
        } else {
            // Generate content based on email type
            return generateContentByType(emailMessage);
        }
    }

    private String generateContentByType(EmailMessage emailMessage) {
        var data = emailMessage.getTemplateData();
        String baseUrl = frontendUrl.split(",")[0];
        
        return switch (emailMessage.getType()) {
            case WELCOME -> String.format(
                "Hi %s,\n\n" +
                "Welcome to Modern LMS! We're excited to have you join our learning community.\n\n" +
                "Please verify your email by clicking the link below:\n" +
                "%s/verify-email?token=%s\n\n" +
                "Best regards,\n" +
                "Modern LMS Team",
                data.get("firstName"),
                baseUrl,
                data.get("verificationToken")
            );
            
            case ENROLLMENT_CONFIRMATION -> String.format(
                "Hi %s,\n\n" +
                "You have successfully enrolled in the course: %s\n\n" +
                "Instructor: %s\n" +
                "Course Duration: %s hours\n\n" +
                "You can start learning by visiting:\n" +
                "%s/courses/%s\n\n" +
                "Happy learning!\n\n" +
                "Best regards,\n" +
                "Modern LMS Team",
                data.get("studentName"),
                data.get("courseName"),
                data.get("instructorName"),
                data.get("courseDuration"),
                baseUrl,
                data.get("courseId")
            );
            
            case COURSE_PUBLISHED -> String.format(
                "Hi %s,\n\n" +
                "Great news! Your course '%s' has been published and is now available to students.\n\n" +
                "Course URL: %s/courses/%s\n\n" +
                "Students can now discover and enroll in your course. We'll notify you when you get your first enrollments!\n\n" +
                "Best regards,\n" +
                "Modern LMS Team",
                data.get("instructorName"),
                data.get("courseName"),
                baseUrl,
                data.get("courseId")
            );
            
            case CERTIFICATE_READY -> String.format(
                "Hi %s,\n\n" +
                "Congratulations! You have successfully completed the course: %s\n\n" +
                "Your certificate is now ready for download.\n" +
                "Certificate Number: %s\n\n" +
                "Download your certificate from your dashboard:\n" +
                "%s/dashboard/certificates\n\n" +
                "Well done on completing the course!\n\n" +
                "Best regards,\n" +
                "Modern LMS Team",
                data.get("studentName"),
                data.get("courseName"),
                data.get("certificateNumber"),
                baseUrl
            );
            
            case INSTRUCTOR_APPROVED -> String.format(
                "Hi %s,\n\n" +
                "Congratulations! Your instructor application has been approved.\n\n" +
                "You can now start creating and publishing courses on Modern LMS.\n\n" +
                "Get started by visiting your instructor dashboard:\n" +
                "%s/instructor/dashboard\n\n" +
                "Welcome to the Modern LMS instructor community!\n\n" +
                "Best regards,\n" +
                "Modern LMS Team",
                data.get("instructorName"),
                baseUrl
            );
            
            case INSTRUCTOR_REJECTED -> String.format(
                "Hi %s,\n\n" +
                "Thank you for your interest in becoming an instructor on Modern LMS.\n\n" +
                "After reviewing your application, we are unable to approve it at this time.\n\n" +
                "%s\n\n" +
                "You're welcome to reapply in the future. If you have any questions, " +
                "please don't hesitate to contact our support team.\n\n" +
                "Best regards,\n" +
                "Modern LMS Team",
                data.get("instructorName"),
                data.get("reason") != null ? "Reason: " + data.get("reason") : 
                    "Please ensure you meet all our instructor requirements."
            );
            
            case PASSWORD_RESET -> String.format(
                "Hi %s,\n\n" +
                "You requested a password reset for your Modern LMS account.\n\n" +
                "Click the link below to reset your password:\n" +
                "%s/reset-password?token=%s\n\n" +
                "This link will expire in 1 hour.\n\n" +
                "If you didn't request this, please ignore this email.\n\n" +
                "Best regards,\n" +
                "Modern LMS Team",
                data.get("userName"),
                baseUrl,
                data.get("resetToken")
            );
            
            default -> "Thank you for using Modern LMS!";
        };
    }

    private void sendEmail(String to, String subject, String content) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject(subject);
        message.setText(content);
        
        mailSender.send(message);
    }

    private void handleEmailFailure(EmailMessage emailMessage, Exception e) {
        // Implement retry logic or dead letter queue handling
        emailMessage.setRetryCount(emailMessage.getRetryCount() + 1);
        
        if (emailMessage.getRetryCount() < 3) {
            log.info("Retrying email message: {} (attempt {})", 
                    emailMessage.getId(), emailMessage.getRetryCount());
            // Could re-queue the message for retry
        } else {
            log.error("Email message failed after {} attempts: {}", 
                    emailMessage.getRetryCount(), emailMessage.getId());
            // Could send to dead letter queue or alert admins
        }
    }
}
