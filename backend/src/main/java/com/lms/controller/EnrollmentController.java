package com.lms.controller;

import com.lms.entity.Enrollment;
import com.lms.service.EnrollmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/enrollments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    @PostMapping("/courses/{courseId}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Enrollment> enrollInCourse(@PathVariable String courseId) {
        Enrollment enrollment = enrollmentService.enrollInCourse(courseId);
        return ResponseEntity.ok(enrollment);
    }

    @DeleteMapping("/courses/{courseId}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Void> unenrollFromCourse(@PathVariable String courseId) {
        enrollmentService.unenrollFromCourse(courseId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{enrollmentId}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Enrollment> getEnrollment(@PathVariable String enrollmentId) {
        Enrollment enrollment = enrollmentService.getEnrollmentById(enrollmentId);
        return ResponseEntity.ok(enrollment);
    }

    @GetMapping("/courses/{courseId}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Enrollment> getUserEnrollmentForCourse(@PathVariable String courseId) {
        Enrollment enrollment = enrollmentService.getUserEnrollmentForCourse(courseId);
        return ResponseEntity.ok(enrollment);
    }

    @GetMapping("/courses/{courseId}/check")
    @PreAuthorize("hasRole('STUDENT') or hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Boolean> checkEnrollment(@PathVariable String courseId) {
        boolean isEnrolled = enrollmentService.isUserEnrolled(courseId);
        return ResponseEntity.ok(isEnrolled);
    }

    @PutMapping("/{enrollmentId}/progress")
    @PreAuthorize("hasRole('STUDENT') or hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Enrollment> updateProgress(@PathVariable String enrollmentId,
                                                   @RequestParam BigDecimal progressPercentage) {
        Enrollment enrollment = enrollmentService.updateProgress(enrollmentId, progressPercentage);
        return ResponseEntity.ok(enrollment);
    }

    @PutMapping("/{enrollmentId}/last-lesson")
    @PreAuthorize("hasRole('STUDENT') or hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Enrollment> updateLastAccessedLesson(@PathVariable String enrollmentId,
                                                             @RequestParam String lessonId) {
        Enrollment enrollment = enrollmentService.updateLastAccessedLesson(enrollmentId, lessonId);
        return ResponseEntity.ok(enrollment);
    }

    @GetMapping("/my-enrollments")
    @PreAuthorize("hasRole('STUDENT') or hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Page<Enrollment>> getUserEnrollments(@PageableDefault(size = 12) Pageable pageable) {
        Page<Enrollment> enrollments = enrollmentService.getUserEnrollments(pageable);
        return ResponseEntity.ok(enrollments);
    }

    @GetMapping("/my-enrollments/completed")
    @PreAuthorize("hasRole('STUDENT') or hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Page<Enrollment>> getUserCompletedEnrollments(@PageableDefault(size = 12) Pageable pageable) {
        Page<Enrollment> enrollments = enrollmentService.getUserCompletedEnrollments(pageable);
        return ResponseEntity.ok(enrollments);
    }

    @GetMapping("/my-enrollments/in-progress")
    @PreAuthorize("hasRole('STUDENT') or hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Page<Enrollment>> getUserInProgressEnrollments(@PageableDefault(size = 12) Pageable pageable) {
        Page<Enrollment> enrollments = enrollmentService.getUserInProgressEnrollments(pageable);
        return ResponseEntity.ok(enrollments);
    }

    @GetMapping("/courses/{courseId}/enrollments")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Page<Enrollment>> getCourseEnrollments(@PathVariable String courseId,
                                                               @PageableDefault(size = 12) Pageable pageable) {
        Page<Enrollment> enrollments = enrollmentService.getCourseEnrollments(courseId, pageable);
        return ResponseEntity.ok(enrollments);
    }

    @GetMapping("/instructor/enrollments")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Page<Enrollment>> getInstructorEnrollments(@PageableDefault(size = 12) Pageable pageable) {
        Page<Enrollment> enrollments = enrollmentService.getInstructorEnrollments(pageable);
        return ResponseEntity.ok(enrollments);
    }

    @GetMapping("/my-enrollments/count")
    @PreAuthorize("hasRole('STUDENT') or hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Long> getUserEnrollmentCount() {
        long count = enrollmentService.getUserEnrollmentCount();
        return ResponseEntity.ok(count);
    }

    @GetMapping("/my-enrollments/completed/count")
    @PreAuthorize("hasRole('STUDENT') or hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Long> getUserCompletedEnrollmentCount() {
        long count = enrollmentService.getUserCompletedEnrollmentCount();
        return ResponseEntity.ok(count);
    }

    @GetMapping("/instructor/stats")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Object[]> getInstructorEnrollmentStats() {
        Object[] stats = enrollmentService.getInstructorEnrollmentStats();
        return ResponseEntity.ok(stats);
    }
}
