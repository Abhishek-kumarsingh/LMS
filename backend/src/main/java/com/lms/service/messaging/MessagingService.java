package com.lms.service.messaging;

import com.lms.dto.messaging.CertificateMessage;
import com.lms.dto.messaging.EmailMessage;
import com.lms.dto.messaging.NotificationMessage;
import com.lms.entity.*;
import com.lms.repository.EnrollmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class MessagingService {

    private final MessageProducerService messageProducerService;
    private final EnrollmentRepository enrollmentRepository;

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

    // Assignment-related messaging methods
    public void sendAssignmentPublishedNotification(Assignment assignment) {
        String title = "New Assignment Available";
        String message = String.format("A new assignment '%s' has been published in '%s'",
                assignment.getTitle(), assignment.getCourse().getTitle());

        Map<String, Object> data = new HashMap<>();
        data.put("assignmentId", assignment.getId());
        data.put("assignmentTitle", assignment.getTitle());
        data.put("courseId", assignment.getCourse().getId());
        data.put("courseName", assignment.getCourse().getTitle());
        data.put("dueDate", assignment.getDueDate());

        // Send to all enrolled students
        List<Enrollment> enrollments = enrollmentRepository.findByCourse(assignment.getCourse());
        for (Enrollment enrollment : enrollments) {
            NotificationMessage notificationMessage = new NotificationMessage(
                    enrollment.getUser().getId(),
                    title,
                    message,
                    NotificationMessage.NotificationType.ASSIGNMENT_PUBLISHED,
                    data
            );
            messageProducerService.sendNotificationMessage(notificationMessage);
        }
    }

    public void sendAssignmentSubmissionNotification(AssignmentSubmission submission) {
        String title = "Assignment Submitted";
        String message = String.format("Student %s has submitted assignment '%s'",
                submission.getStudent().getFullName(), submission.getAssignment().getTitle());

        Map<String, Object> data = new HashMap<>();
        data.put("submissionId", submission.getId());
        data.put("assignmentId", submission.getAssignment().getId());
        data.put("assignmentTitle", submission.getAssignment().getTitle());
        data.put("studentName", submission.getStudent().getFullName());
        data.put("submittedAt", submission.getSubmittedAt());
        data.put("isLate", submission.isLate());

        // Send to instructor
        NotificationMessage notificationMessage = new NotificationMessage(
                submission.getAssignment().getCreatedBy().getId(),
                title,
                message,
                NotificationMessage.NotificationType.ASSIGNMENT_SUBMISSION,
                data
        );

        messageProducerService.sendNotificationMessage(notificationMessage);
    }

    public void sendGradeReleasedNotification(AssignmentGrade grade) {
        String title = "Grade Released";
        String message = String.format("Your grade for assignment '%s' has been released",
                grade.getAssignment().getTitle());

        Map<String, Object> data = new HashMap<>();
        data.put("gradeId", grade.getId());
        data.put("assignmentId", grade.getAssignment().getId());
        data.put("assignmentTitle", grade.getAssignment().getTitle());
        data.put("pointsEarned", grade.getPointsEarned());
        data.put("pointsPossible", grade.getPointsPossible());
        data.put("percentage", grade.getPercentage());
        data.put("letterGrade", grade.getLetterGrade());

        NotificationMessage notificationMessage = new NotificationMessage(
                grade.getStudent().getId(),
                title,
                message,
                NotificationMessage.NotificationType.GRADE_RELEASED,
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

    // System notification methods
    public void sendSystemNotification(User user, String title, String message) {
        NotificationMessage notificationMessage = new NotificationMessage(
                user.getId(),
                title,
                message,
                NotificationMessage.NotificationType.SYSTEM_ANNOUNCEMENT
        );

        messageProducerService.sendNotificationMessage(notificationMessage);
    }
}
