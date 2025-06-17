package com.lms.service;

import com.lms.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${cors.allowed-origins}")
    private String frontendUrl;

    public void sendWelcomeEmail(User user) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(user.getEmail());
            message.setSubject("Welcome to Modern LMS!");
            message.setText(String.format(
                "Hi %s,\n\n" +
                "Welcome to Modern LMS! We're excited to have you join our learning community.\n\n" +
                "Please verify your email by clicking the link below:\n" +
                "%s/verify-email?token=%s\n\n" +
                "Best regards,\n" +
                "Modern LMS Team",
                user.getFirstName(),
                frontendUrl.split(",")[0], // Use first URL
                user.getVerificationToken()
            ));

            mailSender.send(message);
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
}
