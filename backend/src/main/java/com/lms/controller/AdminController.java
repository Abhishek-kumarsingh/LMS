package com.lms.controller;

import com.lms.dto.admin.InstructorApprovalRequest;
import com.lms.dto.user.UserDto;
import com.lms.entity.User;
import com.lms.entity.Course;
import com.lms.entity.Enrollment;
import com.lms.entity.CourseReview;
import com.lms.entity.CourseComment;
import com.lms.entity.Certificate;
import com.lms.entity.Notification;
import com.lms.service.UserService;
import com.lms.service.AdminService;
import com.lms.service.CourseService;
import com.lms.service.EnrollmentService;
import com.lms.service.CourseReviewService;
import com.lms.service.CourseCommentService;
import com.lms.service.CertificateService;
import com.lms.service.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserService userService;
    private final AdminService adminService;
    private final CourseService courseService;
    private final EnrollmentService enrollmentService;
    private final CourseReviewService reviewService;
    private final CourseCommentService commentService;
    private final CertificateService certificateService;
    private final NotificationService notificationService;

    @GetMapping("/users")
    public ResponseEntity<Page<UserDto>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) User.Role role) {
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<UserDto> users = userService.getAllUsers(search, role, pageable);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/instructors/pending")
    public ResponseEntity<List<UserDto>> getPendingInstructors() {
        List<UserDto> pendingInstructors = userService.getPendingInstructors();
        return ResponseEntity.ok(pendingInstructors);
    }

    @PostMapping("/instructors/approve")
    public ResponseEntity<UserDto> approveInstructor(@Valid @RequestBody InstructorApprovalRequest request) {
        UserDto approvedInstructor = userService.approveInstructor(request);
        return ResponseEntity.ok(approvedInstructor);
    }

    @PutMapping("/users/{userId}/toggle-status")
    public ResponseEntity<Map<String, String>> toggleUserStatus(@PathVariable String userId) {
        userService.toggleUserStatus(userId);
        return ResponseEntity.ok(Map.of("message", "User status updated successfully"));
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable String userId) {
        userService.deleteUser(userId);
        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }

    // Analytics Endpoints
    @GetMapping("/analytics/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardAnalytics() {
        Map<String, Object> analytics = adminService.getDashboardAnalytics();
        return ResponseEntity.ok(analytics);
    }

    @GetMapping("/analytics/users")
    public ResponseEntity<Map<String, Object>> getUserAnalytics() {
        Map<String, Object> analytics = adminService.getUserAnalytics();
        return ResponseEntity.ok(analytics);
    }

    @GetMapping("/analytics/courses")
    public ResponseEntity<Map<String, Object>> getCourseAnalytics() {
        Map<String, Object> analytics = adminService.getCourseAnalytics();
        return ResponseEntity.ok(analytics);
    }

    @GetMapping("/analytics/enrollments")
    public ResponseEntity<Map<String, Object>> getEnrollmentAnalytics() {
        Map<String, Object> analytics = adminService.getEnrollmentAnalytics();
        return ResponseEntity.ok(analytics);
    }

    @GetMapping("/analytics/revenue")
    public ResponseEntity<Map<String, Object>> getRevenueAnalytics() {
        Map<String, Object> analytics = adminService.getRevenueAnalytics();
        return ResponseEntity.ok(analytics);
    }

    // Course Management
    @GetMapping("/courses")
    public ResponseEntity<Page<Course>> getAllCourses(Pageable pageable) {
        Page<Course> courses = adminService.getAllCourses(pageable);
        return ResponseEntity.ok(courses);
    }

    @GetMapping("/courses/pending")
    public ResponseEntity<Page<Course>> getPendingCourses(Pageable pageable) {
        Page<Course> courses = adminService.getPendingCourses(pageable);
        return ResponseEntity.ok(courses);
    }

    @PutMapping("/courses/{courseId}/approve")
    public ResponseEntity<Course> approveCourse(@PathVariable String courseId) {
        Course course = courseService.publishCourse(courseId);
        return ResponseEntity.ok(course);
    }

    @PutMapping("/courses/{courseId}/reject")
    public ResponseEntity<Course> rejectCourse(@PathVariable String courseId) {
        Course course = courseService.unpublishCourse(courseId);
        return ResponseEntity.ok(course);
    }

    @DeleteMapping("/courses/{courseId}")
    public ResponseEntity<Map<String, String>> deleteCourse(@PathVariable String courseId) {
        courseService.deleteCourse(courseId);
        return ResponseEntity.ok(Map.of("message", "Course deleted successfully"));
    }

    // Content Moderation
    @GetMapping("/reviews/pending")
    public ResponseEntity<Page<CourseReview>> getPendingReviews(Pageable pageable) {
        Page<CourseReview> reviews = reviewService.getReviewsPendingModeration(pageable);
        return ResponseEntity.ok(reviews);
    }

    @PutMapping("/reviews/{reviewId}/moderate")
    public ResponseEntity<CourseReview> moderateReview(@PathVariable String reviewId,
                                                     @RequestParam boolean approve) {
        CourseReview review = reviewService.moderateReview(reviewId, approve);
        return ResponseEntity.ok(review);
    }

    @GetMapping("/comments/pending")
    public ResponseEntity<Page<CourseComment>> getPendingComments(Pageable pageable) {
        Page<CourseComment> comments = commentService.getCommentsPendingModeration(pageable);
        return ResponseEntity.ok(comments);
    }

    @PutMapping("/comments/{commentId}/moderate")
    public ResponseEntity<CourseComment> moderateComment(@PathVariable String commentId,
                                                       @RequestParam boolean approve) {
        CourseComment comment = commentService.moderateComment(commentId, approve);
        return ResponseEntity.ok(comment);
    }

    // System Management
    @GetMapping("/enrollments")
    public ResponseEntity<Page<Enrollment>> getAllEnrollments(Pageable pageable) {
        Page<Enrollment> enrollments = adminService.getAllEnrollments(pageable);
        return ResponseEntity.ok(enrollments);
    }

    @GetMapping("/certificates")
    public ResponseEntity<Page<Certificate>> getAllCertificates(Pageable pageable) {
        Page<Certificate> certificates = adminService.getAllCertificates(pageable);
        return ResponseEntity.ok(certificates);
    }

    @GetMapping("/certificates/pending")
    public ResponseEntity<Page<Certificate>> getPendingCertificates(Pageable pageable) {
        Page<Certificate> certificates = certificateService.getCertificatesByStatus(Certificate.Status.PENDING, pageable);
        return ResponseEntity.ok(certificates);
    }

    @PostMapping("/certificates/process-pending")
    public ResponseEntity<Map<String, String>> processPendingCertificates() {
        certificateService.processPendingCertificates();
        return ResponseEntity.ok(Map.of("message", "Processing pending certificates"));
    }

    // Notifications Management
    @GetMapping("/notifications")
    public ResponseEntity<Page<Notification>> getAllNotifications(Pageable pageable) {
        Page<Notification> notifications = notificationService.getAllNotifications(pageable);
        return ResponseEntity.ok(notifications);
    }

    @PostMapping("/notifications/broadcast")
    public ResponseEntity<Map<String, String>> broadcastNotification(@RequestBody Map<String, String> request) {
        adminService.broadcastSystemNotification(request.get("title"), request.get("message"));
        return ResponseEntity.ok(Map.of("message", "Notification broadcasted successfully"));
    }

    // Reports and Exports
    @GetMapping("/reports/users")
    public ResponseEntity<Map<String, Object>> getUsersReport() {
        Map<String, Object> report = adminService.generateUsersReport();
        return ResponseEntity.ok(report);
    }

    @GetMapping("/reports/courses")
    public ResponseEntity<Map<String, Object>> getCoursesReport() {
        Map<String, Object> report = adminService.generateCoursesReport();
        return ResponseEntity.ok(report);
    }

    @GetMapping("/reports/enrollments")
    public ResponseEntity<Map<String, Object>> getEnrollmentsReport() {
        Map<String, Object> report = adminService.generateEnrollmentsReport();
        return ResponseEntity.ok(report);
    }

    // System Health and Monitoring
    @GetMapping("/system/health")
    public ResponseEntity<Map<String, Object>> getSystemHealth() {
        Map<String, Object> health = adminService.getSystemHealth();
        return ResponseEntity.ok(health);
    }

    @GetMapping("/system/stats")
    public ResponseEntity<Map<String, Object>> getSystemStats() {
        Map<String, Object> stats = adminService.getSystemStats();
        return ResponseEntity.ok(stats);
    }
}
