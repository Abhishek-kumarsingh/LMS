package com.lms.service;

import com.lms.entity.Course;
import com.lms.entity.Enrollment;

import com.lms.entity.User;
import com.lms.exception.BadRequestException;
import com.lms.exception.ResourceNotFoundException;
import com.lms.repository.CourseRepository;
import com.lms.repository.EnrollmentRepository;
import com.lms.repository.UserRepository;
import com.lms.service.messaging.MessagingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final MessagingService messagingService;

    public Enrollment enrollInCourse(String courseId) {
        User currentUser = getCurrentUser();
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        // Check if course is published
        if (!course.isPublished()) {
            throw new BadRequestException("Cannot enroll in unpublished course");
        }

        // Check if user is already enrolled
        if (enrollmentRepository.existsByUserAndCourse(currentUser, course)) {
            throw new BadRequestException("User is already enrolled in this course");
        }

        // Check if user is the instructor of the course
        if (course.getInstructor().getId().equals(currentUser.getId())) {
            throw new BadRequestException("Instructors cannot enroll in their own courses");
        }

        // Create enrollment
        Enrollment enrollment = new Enrollment();
        enrollment.setId(UUID.randomUUID().toString());
        enrollment.setUser(currentUser);
        enrollment.setCourse(course);
        enrollment.setProgressPercentage(BigDecimal.ZERO);
        enrollment.setActive(true);

        Enrollment savedEnrollment = enrollmentRepository.save(enrollment);

        // Update course enrollment count
        course.setEnrolledCount(course.getEnrolledCount() + 1);
        courseRepository.save(course);

        log.info("User {} enrolled in course {}", currentUser.getEmail(), course.getTitle());

        // Send enrollment confirmation email and notification
        try {
            messagingService.sendEnrollmentConfirmation(currentUser, course);
        } catch (Exception e) {
            log.error("Failed to send enrollment confirmation", e);
        }

        return savedEnrollment;
    }

    public void unenrollFromCourse(String courseId) {
        User currentUser = getCurrentUser();
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        Enrollment enrollment = enrollmentRepository.findByUserAndCourse(currentUser, course)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment not found"));

        // Deactivate enrollment instead of deleting
        enrollment.setActive(false);
        enrollmentRepository.save(enrollment);

        // Update course enrollment count
        course.setEnrolledCount(Math.max(0, course.getEnrolledCount() - 1));
        courseRepository.save(course);

        log.info("User {} unenrolled from course {}", currentUser.getEmail(), course.getTitle());
    }

    public Enrollment updateProgress(String enrollmentId, BigDecimal progressPercentage) {
        Enrollment enrollment = getEnrollmentById(enrollmentId);
        User currentUser = getCurrentUser();

        // Check if user owns this enrollment
        if (!enrollment.getUser().getId().equals(currentUser.getId())) {
            throw new BadRequestException("You can only update your own enrollment progress");
        }

        enrollment.setProgressPercentage(progressPercentage);
        enrollment.setLastAccessedAt(LocalDateTime.now());

        // Mark as completed if progress is 100%
        if (progressPercentage.compareTo(new BigDecimal("100")) >= 0) {
            enrollment.markAsCompleted();
            log.info("Course completed by user {} for course {}",
                    currentUser.getEmail(), enrollment.getCourse().getTitle());

            // Send course completion notification and trigger certificate generation
            try {
                messagingService.sendCourseCompletionNotification(currentUser, enrollment.getCourse());
                messagingService.requestCertificateGeneration(enrollment);
            } catch (Exception e) {
                log.error("Failed to send course completion notifications", e);
            }
        }

        return enrollmentRepository.save(enrollment);
    }

    public Enrollment updateLastAccessedLesson(String enrollmentId, String lessonId) {
        Enrollment enrollment = getEnrollmentById(enrollmentId);
        User currentUser = getCurrentUser();

        // Check if user owns this enrollment
        if (!enrollment.getUser().getId().equals(currentUser.getId())) {
            throw new BadRequestException("You can only update your own enrollment");
        }

        // Find the lesson (you'll need to implement LessonRepository)
        // For now, we'll just update the timestamp
        enrollment.setLastAccessedAt(LocalDateTime.now());

        return enrollmentRepository.save(enrollment);
    }

    @Transactional(readOnly = true)
    public Enrollment getEnrollmentById(String enrollmentId) {
        return enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment not found"));
    }

    @Transactional(readOnly = true)
    public Enrollment getUserEnrollmentForCourse(String courseId) {
        User currentUser = getCurrentUser();
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        return enrollmentRepository.findByUserAndCourse(currentUser, course)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment not found"));
    }

    @Transactional(readOnly = true)
    public boolean isUserEnrolled(String courseId) {
        User currentUser = getCurrentUser();
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        return enrollmentRepository.existsByUserAndCourse(currentUser, course);
    }

    @Transactional(readOnly = true)
    public Page<Enrollment> getUserEnrollments(Pageable pageable) {
        User currentUser = getCurrentUser();
        return enrollmentRepository.findByUserAndIsActiveTrueOrderByEnrolledAtDesc(currentUser, pageable);
    }

    @Transactional(readOnly = true)
    public Page<Enrollment> getUserCompletedEnrollments(Pageable pageable) {
        User currentUser = getCurrentUser();
        return enrollmentRepository.findByUserAndCompletedAtIsNotNullOrderByCompletedAtDesc(currentUser, pageable);
    }

    @Transactional(readOnly = true)
    public Page<Enrollment> getUserInProgressEnrollments(Pageable pageable) {
        User currentUser = getCurrentUser();
        return enrollmentRepository.findInProgressByUser(currentUser, pageable);
    }

    @Transactional(readOnly = true)
    public Page<Enrollment> getCourseEnrollments(String courseId, Pageable pageable) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        
        User currentUser = getCurrentUser();
        
        // Check if user is instructor or admin
        if (!currentUser.isAdmin() && !course.getInstructor().getId().equals(currentUser.getId())) {
            throw new BadRequestException("You can only view enrollments for your own courses");
        }

        return enrollmentRepository.findByCourseOrderByEnrolledAtDesc(course, pageable);
    }

    @Transactional(readOnly = true)
    public Page<Enrollment> getInstructorEnrollments(Pageable pageable) {
        User currentUser = getCurrentUser();
        
        if (!currentUser.isInstructor() && !currentUser.isAdmin()) {
            throw new BadRequestException("Only instructors can view their enrollments");
        }

        return enrollmentRepository.findByInstructor(currentUser, pageable);
    }

    @Transactional(readOnly = true)
    public long getUserEnrollmentCount() {
        User currentUser = getCurrentUser();
        return enrollmentRepository.countByUser(currentUser);
    }

    @Transactional(readOnly = true)
    public long getUserCompletedEnrollmentCount() {
        User currentUser = getCurrentUser();
        return enrollmentRepository.countByUserAndCompletedAtIsNotNull(currentUser);
    }

    @Transactional(readOnly = true)
    public Object[] getInstructorEnrollmentStats() {
        User currentUser = getCurrentUser();
        
        if (!currentUser.isInstructor() && !currentUser.isAdmin()) {
            throw new BadRequestException("Only instructors can view enrollment statistics");
        }

        return enrollmentRepository.getInstructorEnrollmentStats(currentUser);
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
