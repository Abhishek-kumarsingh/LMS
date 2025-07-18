package com.lms.service;

import com.lms.entity.Course;
import com.lms.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import javax.mail.MessagingException;
import javax.mail.internet.MimeMessage;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final EmailTemplateService templateService;
    private final RateLimitService rateLimitService;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${cors.allowed-origins}")
    private String frontendUrl;

    public void sendWelcomeEmail(User user) {
        // Check rate limit
        if (!rateLimitService.checkEmailRateLimit(user.getId())) {
            log.warn("Email rate limit exceeded for user: {}", user.getId());
            return;
        }

        try {
            Map<String, Object> templateData = new HashMap<>();
            templateData.put("firstName", user.getFirstName());
            templateData.put("verificationToken", user.getVerificationToken());

            String htmlContent = templateService.generateWelcomeEmail(templateData);

            sendHtmlEmail(user.getEmail(), "Welcome to Modern LMS!", htmlContent);
            log.info("Welcome email sent to: {}", user.getEmail());
        } catch (Exception e) {
            log.error("Failed to send welcome email to: {}", user.getEmail(), e);
        }
    }

    public void sendPasswordResetEmail(User user, String resetToken) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(user.getEmail());
            message.setSubject("Password Reset Request");
            message.setText(String.format(
                "Hi %s,\n\n" +
                "You requested a password reset for your Modern LMS account.\n\n" +
                "Click the link below to reset your password:\n" +
                "%s/reset-password?token=%s\n\n" +
                "This link will expire in 1 hour.\n\n" +
                "If you didn't request this, please ignore this email.\n\n" +
                "Best regards,\n" +
                "Modern LMS Team",
                user.getFirstName(),
                frontendUrl.split(",")[0],
                resetToken
            ));

            mailSender.send(message);
            log.info("Password reset email sent to: {}", user.getEmail());
        } catch (Exception e) {
            log.error("Failed to send password reset email to: {}", user.getEmail(), e);
        }
    }

    public void sendInstructorApplicationNotification(User instructor) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo("admin@modernlms.com"); // Admin email
            message.setSubject("New Instructor Application");
            message.setText(String.format(
                "A new instructor application has been submitted:\n\n" +
                "Name: %s %s\n" +
                "Email: %s\n" +
                "Registration Date: %s\n\n" +
                "Please review and approve the application in the admin dashboard.\n\n" +
                "Modern LMS System",
                instructor.getFirstName(),
                instructor.getLastName(),
                instructor.getEmail(),
                instructor.getCreatedAt()
            ));

            mailSender.send(message);
            log.info("Instructor application notification sent for: {}", instructor.getEmail());
        } catch (Exception e) {
            log.error("Failed to send instructor application notification for: {}", instructor.getEmail(), e);
        }
    }

    public void sendInstructorApprovedEmail(User instructor) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(instructor.getEmail());
            message.setSubject("Instructor Application Approved!");
            message.setText(String.format(
                "Hi %s,\n\n" +
                "Congratulations! Your instructor application has been approved.\n\n" +
                "You can now start creating and publishing courses on Modern LMS.\n\n" +
                "Get started by visiting your instructor dashboard:\n" +
                "%s/instructor/dashboard\n\n" +
                "Welcome to the Modern LMS instructor community!\n\n" +
                "Best regards,\n" +
                "Modern LMS Team",
                instructor.getFirstName(),
                frontendUrl.split(",")[0]
            ));

            mailSender.send(message);
            log.info("Instructor approval email sent to: {}", instructor.getEmail());
        } catch (Exception e) {
            log.error("Failed to send instructor approval email to: {}", instructor.getEmail(), e);
        }
    }

    public void sendInstructorRejectedEmail(User instructor, String reason) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(instructor.getEmail());
            message.setSubject("Instructor Application Update");
            message.setText(String.format(
                "Hi %s,\n\n" +
                "Thank you for your interest in becoming an instructor on Modern LMS.\n\n" +
                "After reviewing your application, we are unable to approve it at this time.\n\n" +
                "%s\n\n" +
                "You're welcome to reapply in the future. If you have any questions, " +
                "please don't hesitate to contact our support team.\n\n" +
                "Best regards,\n" +
                "Modern LMS Team",
                instructor.getFirstName(),
                reason != null ? "Reason: " + reason : "Please ensure you meet all our instructor requirements."
            ));

            mailSender.send(message);
            log.info("Instructor rejection email sent to: {}", instructor.getEmail());
        } catch (Exception e) {
            log.error("Failed to send instructor rejection email to: {}", instructor.getEmail(), e);
        }
    }

    public void sendEnrollmentConfirmation(User user, Course course) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(user.getEmail());
            message.setSubject("Course Enrollment Confirmation");
            message.setText(String.format(
                "Hi %s,\n\n" +
                "You have successfully enrolled in the course: %s\n\n" +
                "Instructor: %s\n" +
                "Course Duration: %s hours\n\n" +
                "You can start learning by visiting:\n" +
                "%s/courses/%s\n\n" +
                "Happy learning!\n\n" +
                "Best regards,\n" +
                "Modern LMS Team",
                user.getFirstName(),
                course.getTitle(),
                course.getInstructor().getFullName(),
                course.getDurationMinutes() / 60,
                frontendUrl.split(",")[0],
                course.getId()
            ));

            mailSender.send(message);
            log.info("Enrollment confirmation email sent to: {}", user.getEmail());
        } catch (Exception e) {
            log.error("Failed to send enrollment confirmation email to: {}", user.getEmail(), e);
        }
    }

    public void sendCoursePublishedNotification(Course course) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(course.getInstructor().getEmail());
            message.setSubject("Course Published Successfully");
            message.setText(String.format(
                "Hi %s,\n\n" +
                "Great news! Your course '%s' has been published and is now available to students.\n\n" +
                "Course URL: %s/courses/%s\n\n" +
                "Students can now discover and enroll in your course. We'll notify you when you get your first enrollments!\n\n" +
                "Best regards,\n" +
                "Modern LMS Team",
                course.getInstructor().getFirstName(),
                course.getTitle(),
                frontendUrl.split(",")[0],
                course.getId()
            ));

            mailSender.send(message);
            log.info("Course published notification sent to: {}", course.getInstructor().getEmail());
        } catch (Exception e) {
            log.error("Failed to send course published notification to: {}", course.getInstructor().getEmail(), e);
        }
    }

    public void sendCertificateGeneratedNotification(User user, Course course, String certificateNumber) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(user.getEmail());
            message.setSubject("Certificate Ready for Download");
            message.setText(String.format(
                "Hi %s,\n\n" +
                "Congratulations! You have successfully completed the course: %s\n\n" +
                "Your certificate is now ready for download.\n" +
                "Certificate Number: %s\n\n" +
                "Download your certificate from your dashboard:\n" +
                "%s/dashboard/certificates\n\n" +
                "Well done on completing the course!\n\n" +
                "Best regards,\n" +
                "Modern LMS Team",
                user.getFirstName(),
                course.getTitle(),
                certificateNumber,
                frontendUrl.split(",")[0]
            ));

            mailSender.send(message);
            log.info("Certificate notification email sent to: {}", user.getEmail());
        } catch (Exception e) {
            log.error("Failed to send certificate notification email to: {}", user.getEmail(), e);
        }
    }

    /**
     * Send HTML email
     */
    private void sendHtmlEmail(String to, String subject, String htmlContent) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(fromEmail);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlContent, true); // true indicates HTML content

        mailSender.send(message);
    }

    /**
     * Enhanced password reset email with HTML template
     */
    public void sendPasswordResetEmailEnhanced(User user, String resetToken) {
        // Check rate limit
        if (!rateLimitService.checkEmailRateLimit(user.getId())) {
            log.warn("Email rate limit exceeded for user: {}", user.getId());
            return;
        }

        try {
            Map<String, Object> templateData = new HashMap<>();
            templateData.put("firstName", user.getFirstName());
            templateData.put("resetToken", resetToken);

            String htmlContent = templateService.generatePasswordResetEmail(templateData);

            sendHtmlEmail(user.getEmail(), "Password Reset Request - Modern LMS", htmlContent);
            log.info("Enhanced password reset email sent to: {}", user.getEmail());
        } catch (Exception e) {
            log.error("Failed to send enhanced password reset email to: {}", user.getEmail(), e);
        }
    }
}
