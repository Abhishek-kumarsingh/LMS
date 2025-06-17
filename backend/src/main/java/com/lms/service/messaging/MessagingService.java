package com.lms.service.messaging;

import com.lms.dto.messaging.CertificateMessage;
import com.lms.dto.messaging.EmailMessage;
import com.lms.dto.messaging.NotificationMessage;
import com.lms.entity.Course;
import com.lms.entity.Enrollment;
import com.lms.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class MessagingService {

    private final MessageProducerService messageProducerService;

    // Email messaging methods
    public void sendWelcomeEmail(User user) {
        Map<String, Object> data = new HashMap<>();
        data.put("firstName", user.getFirstName());
        data.put("verificationToken", user.getVerificationToken());
        
        EmailMessage emailMessage = new EmailMessage(
                user.getEmail(),
                "Welcome to Modern LMS!",
                EmailMessage.EmailType.WELCOME,
                data
        );
        
        messageProducerService.sendEmailMessage(emailMessage);
    }

    public void sendEnrollmentConfirmation(User user, Course course) {
        Map<String, Object> data = new HashMap<>();
        data.put("studentName", user.getFullName());
        data.put("courseName", course.getTitle());
        data.put("instructorName", course.getInstructor().getFullName());
        data.put("courseDuration", course.getDurationMinutes() / 60);
        data.put("courseId", course.getId());
        
        EmailMessage emailMessage = new EmailMessage(
                user.getEmail(),
                "Course Enrollment Confirmation",
                EmailMessage.EmailType.ENROLLMENT_CONFIRMATION,
                data
        );
        
        messageProducerService.sendEmailMessage(emailMessage);
        
        // Also send notification
        sendEnrollmentNotification(user, course);
    }

    public void sendCoursePublishedEmail(Course course) {
        Map<String, Object> data = new HashMap<>();
        data.put("instructorName", course.getInstructor().getFullName());
        data.put("courseName", course.getTitle());
        data.put("courseId", course.getId());
        
        EmailMessage emailMessage = new EmailMessage(
                course.getInstructor().getEmail(),
                "Course Published Successfully",
                EmailMessage.EmailType.COURSE_PUBLISHED,
                data
        );
        
        messageProducerService.sendEmailMessage(emailMessage);
        
        // Also send notification
        sendCoursePublishedNotification(course);
    }

    public void sendInstructorApprovedEmail(User instructor) {
        Map<String, Object> data = new HashMap<>();
        data.put("instructorName", instructor.getFullName());
        
        EmailMessage emailMessage = new EmailMessage(
                instructor.getEmail(),
                "Instructor Application Approved!",
                EmailMessage.EmailType.INSTRUCTOR_APPROVED,
                data
        );
        
        messageProducerService.sendEmailMessage(emailMessage);
        
        // Also send notification
        sendInstructorApprovedNotification(instructor);
    }

    public void sendInstructorRejectedEmail(User instructor, String reason) {
        Map<String, Object> data = new HashMap<>();
        data.put("instructorName", instructor.getFullName());
        data.put("reason", reason);
        
        EmailMessage emailMessage = new EmailMessage(
                instructor.getEmail(),
                "Instructor Application Update",
                EmailMessage.EmailType.INSTRUCTOR_REJECTED,
                data
        );
        
        messageProducerService.sendEmailMessage(emailMessage);
    }

    public void sendPasswordResetEmail(User user, String resetToken) {
        Map<String, Object> data = new HashMap<>();
        data.put("userName", user.getFullName());
        data.put("resetToken", resetToken);
        
        EmailMessage emailMessage = new EmailMessage(
                user.getEmail(),
                "Password Reset Request",
                EmailMessage.EmailType.PASSWORD_RESET,
                data
        );
        
        messageProducerService.sendEmailMessage(emailMessage);
    }

    // Notification messaging methods
    public void sendEnrollmentNotification(User user, Course course) {
        String title = "Course Enrollment Successful";
        String message = String.format("You have successfully enrolled in '%s'", course.getTitle());
        
        Map<String, Object> data = new HashMap<>();
        data.put("courseId", course.getId());
        data.put("courseName", course.getTitle());
        data.put("instructorName", course.getInstructor().getFullName());
        
        NotificationMessage notificationMessage = new NotificationMessage(
                user.getId(),
                title,
                message,
                NotificationMessage.NotificationType.COURSE_ENROLLMENT,
                data
        );
        
        messageProducerService.sendNotificationMessage(notificationMessage);
    }

    public void sendCourseCompletionNotification(User user, Course course) {
        String title = "Course Completed!";
        String message = String.format("Congratulations! You have completed '%s'", course.getTitle());
        
        Map<String, Object> data = new HashMap<>();
        data.put("courseId", course.getId());
        data.put("courseName", course.getTitle());
        
        NotificationMessage notificationMessage = new NotificationMessage(
                user.getId(),
                title,
                message,
                NotificationMessage.NotificationType.COURSE_COMPLETION,
                data
        );
        
        messageProducerService.sendNotificationMessage(notificationMessage);
    }

    public void sendCoursePublishedNotification(Course course) {
        String title = "Course Published";
        String message = String.format("Your course '%s' has been published successfully", course.getTitle());
        
        Map<String, Object> data = new HashMap<>();
        data.put("courseId", course.getId());
        data.put("courseName", course.getTitle());
        
        NotificationMessage notificationMessage = new NotificationMessage(
                course.getInstructor().getId(),
                title,
                message,
                NotificationMessage.NotificationType.NEW_COURSE_PUBLISHED,
                data
        );
        
        messageProducerService.sendNotificationMessage(notificationMessage);
    }

    public void sendInstructorApprovedNotification(User instructor) {
        String title = "Instructor Application Approved";
        String message = "Congratulations! Your instructor application has been approved.";
        
        NotificationMessage notificationMessage = new NotificationMessage(
                instructor.getId(),
                title,
                message,
                NotificationMessage.NotificationType.INSTRUCTOR_APPROVED
        );
        
        messageProducerService.sendNotificationMessage(notificationMessage);
    }

    public void sendReviewReceivedNotification(User instructor, Course course, String reviewerName) {
        String title = "New Review Received";
        String message = String.format("%s left a review for your course '%s'", reviewerName, course.getTitle());
        
        Map<String, Object> data = new HashMap<>();
        data.put("courseId", course.getId());
        data.put("courseName", course.getTitle());
        data.put("reviewerName", reviewerName);
        
        NotificationMessage notificationMessage = new NotificationMessage(
                instructor.getId(),
                title,
                message,
                NotificationMessage.NotificationType.REVIEW_RECEIVED,
                data
        );
        
        messageProducerService.sendNotificationMessage(notificationMessage);
    }

    public void sendCommentReceivedNotification(User instructor, Course course, String commenterName) {
        String title = "New Comment Received";
        String message = String.format("%s commented on your course '%s'", commenterName, course.getTitle());
        
        Map<String, Object> data = new HashMap<>();
        data.put("courseId", course.getId());
        data.put("courseName", course.getTitle());
        data.put("commenterName", commenterName);
        
        NotificationMessage notificationMessage = new NotificationMessage(
                instructor.getId(),
                title,
                message,
                NotificationMessage.NotificationType.COMMENT_RECEIVED,
                data
        );
        
        messageProducerService.sendNotificationMessage(notificationMessage);
    }

    // Certificate messaging methods
    public void requestCertificateGeneration(Enrollment enrollment) {
        CertificateMessage certificateMessage = new CertificateMessage(
                enrollment.getId(),
                enrollment.getUser().getId(),
                enrollment.getCourse().getId(),
                enrollment.getUser().getFullName(),
                enrollment.getCourse().getTitle(),
                enrollment.getCourse().getInstructor().getFullName(),
                enrollment.getCompletedAt()
        );
        
        messageProducerService.sendCertificateMessage(certificateMessage);
    }
}
