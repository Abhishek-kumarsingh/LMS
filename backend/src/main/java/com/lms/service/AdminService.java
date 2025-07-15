package com.lms.service;

import com.lms.entity.*;
import com.lms.exception.BadRequestException;
import com.lms.exception.ResourceNotFoundException;
import com.lms.repository.*;
import com.lms.service.messaging.MessagingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AdminService {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final CourseReviewRepository reviewRepository;
    private final CourseCommentRepository commentRepository;
    private final CertificateRepository certificateRepository;
    private final NotificationRepository notificationRepository;
    private final InstructorEarningsRepository earningsRepository;
    private final CategoryRepository categoryRepository;
    private final MessagingService messagingService;

    // Dashboard Analytics
    @Transactional(readOnly = true)
    public Map<String, Object> getDashboardAnalytics() {
        validateAdminAccess();
        
        Map<String, Object> analytics = new HashMap<>();
        
        // Basic counts
        analytics.put("totalUsers", userRepository.count());
        analytics.put("totalCourses", courseRepository.count());
        analytics.put("totalEnrollments", enrollmentRepository.count());
        analytics.put("totalCertificates", certificateRepository.count());
        
        // User breakdown
        analytics.put("totalStudents", userRepository.countByRole(User.Role.STUDENT));
        analytics.put("totalInstructors", userRepository.countByRole(User.Role.INSTRUCTOR));
        analytics.put("totalAdmins", userRepository.countByRole(User.Role.ADMIN));
        
        // Course statistics
        analytics.put("publishedCourses", courseRepository.countByIsPublishedTrue());
        analytics.put("pendingCourses", courseRepository.countByIsPublishedFalse());
        
        // Recent activity (last 30 days)
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        analytics.put("newUsersLast30Days", userRepository.countByCreatedAtAfter(thirtyDaysAgo));
        analytics.put("newCoursesLast30Days", courseRepository.countByCreatedAtAfter(thirtyDaysAgo));
        analytics.put("newEnrollmentsLast30Days", enrollmentRepository.countByEnrolledAtAfter(thirtyDaysAgo));
        
        // Revenue statistics
        BigDecimal totalRevenue = earningsRepository.getTotalRevenue();
        BigDecimal monthlyRevenue = earningsRepository.getMonthlyRevenue(LocalDateTime.now().getYear(), LocalDateTime.now().getMonthValue());
        analytics.put("totalRevenue", totalRevenue != null ? totalRevenue : BigDecimal.ZERO);
        analytics.put("monthlyRevenue", monthlyRevenue != null ? monthlyRevenue : BigDecimal.ZERO);
        
        return analytics;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getUserAnalytics() {
        validateAdminAccess();
        
        Map<String, Object> analytics = new HashMap<>();
        
        // User role distribution
        analytics.put("usersByRole", Arrays.asList(
            Map.of("role", "STUDENT", "count", userRepository.countByRole(User.Role.STUDENT)),
            Map.of("role", "INSTRUCTOR", "count", userRepository.countByRole(User.Role.INSTRUCTOR)),
            Map.of("role", "ADMIN", "count", userRepository.countByRole(User.Role.ADMIN))
        ));
        
        // User registration trends (last 12 months)
        List<Object[]> monthlyRegistrations = userRepository.getMonthlyRegistrations();
        analytics.put("monthlyRegistrations", monthlyRegistrations);
        
        // Active vs inactive users
        analytics.put("activeUsers", userRepository.countByIsEnabledTrue());
        analytics.put("inactiveUsers", userRepository.countByIsEnabledFalse());
        
        // Pending instructor approvals
        analytics.put("pendingInstructors", userRepository.countByRoleAndIsApprovedFalse(User.Role.INSTRUCTOR));
        
        return analytics;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getCourseAnalytics() {
        validateAdminAccess();
        
        Map<String, Object> analytics = new HashMap<>();
        
        // Course status distribution
        analytics.put("publishedCourses", courseRepository.countByIsPublishedTrue());
        analytics.put("unpublishedCourses", courseRepository.countByIsPublishedFalse());
        
        // Courses by category
        List<Object[]> coursesByCategory = categoryRepository.getCategoriesWithCourseCount();
        analytics.put("coursesByCategory", coursesByCategory);
        
        // Top rated courses
        List<Course> topRatedCourses = courseRepository.findTopRatedCourses(
            org.springframework.data.domain.PageRequest.of(0, 10)).getContent();
        analytics.put("topRatedCourses", topRatedCourses);
        
        // Most enrolled courses
        List<Course> mostEnrolledCourses = courseRepository.findMostEnrolledCourses(
            org.springframework.data.domain.PageRequest.of(0, 10)).getContent();
        analytics.put("mostEnrolledCourses", mostEnrolledCourses);
        
        // Course creation trends
        List<Object[]> monthlyCourseCreation = courseRepository.getMonthlyCourseCreation();
        analytics.put("monthlyCourseCreation", monthlyCourseCreation);
        
        return analytics;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getEnrollmentAnalytics() {
        validateAdminAccess();
        
        Map<String, Object> analytics = new HashMap<>();
        
        // Enrollment statistics
        analytics.put("totalEnrollments", enrollmentRepository.count());
        analytics.put("activeEnrollments", enrollmentRepository.countByIsActiveTrue());
        analytics.put("completedEnrollments", enrollmentRepository.countByCompletedAtIsNotNull());
        
        // Enrollment trends
        List<Object[]> monthlyEnrollments = enrollmentRepository.getMonthlyEnrollmentTrends();
        analytics.put("monthlyEnrollments", monthlyEnrollments);
        
        // Completion rates
        long totalEnrollments = enrollmentRepository.count();
        long completedEnrollments = enrollmentRepository.countByCompletedAtIsNotNull();
        double completionRate = totalEnrollments > 0 ? (double) completedEnrollments / totalEnrollments * 100 : 0;
        analytics.put("completionRate", completionRate);
        
        // Average progress
        Double averageProgress = enrollmentRepository.getAverageProgress();
        analytics.put("averageProgress", averageProgress != null ? averageProgress : 0.0);
        
        return analytics;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getRevenueAnalytics() {
        validateAdminAccess();
        
        Map<String, Object> analytics = new HashMap<>();
        
        // Total revenue
        BigDecimal totalRevenue = earningsRepository.getTotalRevenue();
        analytics.put("totalRevenue", totalRevenue != null ? totalRevenue : BigDecimal.ZERO);
        
        // Monthly revenue trends
        List<Object[]> monthlyRevenue = earningsRepository.getMonthlyRevenueTrends();
        analytics.put("monthlyRevenue", monthlyRevenue);
        
        // Top earning instructors
        List<Object[]> topInstructors = earningsRepository.getTopEarningInstructors(
            org.springframework.data.domain.PageRequest.of(0, 10)).getContent();
        analytics.put("topEarningInstructors", topInstructors);
        
        // Top earning courses
        List<Object[]> topCourses = earningsRepository.getTopEarningCourses(
            org.springframework.data.domain.PageRequest.of(0, 10)).getContent();
        analytics.put("topEarningCourses", topCourses);
        
        // Platform commission
        BigDecimal platformRevenue = earningsRepository.getTotalPlatformRevenue();
        analytics.put("platformRevenue", platformRevenue != null ? platformRevenue : BigDecimal.ZERO);
        
        return analytics;
    }

    // Course Management
    @Transactional(readOnly = true)
    public Page<Course> getAllCourses(Pageable pageable) {
        validateAdminAccess();
        return courseRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public Page<Course> getPendingCourses(Pageable pageable) {
        validateAdminAccess();
        return courseRepository.findByIsPublishedFalseOrderByCreatedAtDesc(pageable);
    }

    // System Management
    @Transactional(readOnly = true)
    public Page<Enrollment> getAllEnrollments(Pageable pageable) {
        validateAdminAccess();
        return enrollmentRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public Page<Certificate> getAllCertificates(Pageable pageable) {
        validateAdminAccess();
        return certificateRepository.findAll(pageable);
    }

    // Notification Broadcasting
    public void broadcastSystemNotification(String title, String message) {
        validateAdminAccess();
        
        List<User> allUsers = userRepository.findByIsEnabledTrue();
        
        for (User user : allUsers) {
            try {
                messagingService.sendSystemNotification(user, title, message);
            } catch (Exception e) {
                log.error("Failed to send notification to user: {}", user.getEmail(), e);
            }
        }
        
        log.info("System notification broadcasted to {} users", allUsers.size());
    }

    // Reports Generation
    @Transactional(readOnly = true)
    public Map<String, Object> generateUsersReport() {
        validateAdminAccess();
        
        Map<String, Object> report = new HashMap<>();
        report.put("generatedAt", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        report.put("totalUsers", userRepository.count());
        report.put("usersByRole", getUserRoleDistribution());
        report.put("usersByStatus", getUserStatusDistribution());
        report.put("recentRegistrations", getRecentRegistrations());
        
        return report;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> generateCoursesReport() {
        validateAdminAccess();
        
        Map<String, Object> report = new HashMap<>();
        report.put("generatedAt", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        report.put("totalCourses", courseRepository.count());
        report.put("coursesByStatus", getCourseStatusDistribution());
        report.put("coursesByCategory", categoryRepository.getCategoriesWithCourseCount());
        report.put("topRatedCourses", getTopRatedCoursesReport());
        
        return report;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> generateEnrollmentsReport() {
        validateAdminAccess();
        
        Map<String, Object> report = new HashMap<>();
        report.put("generatedAt", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        report.put("totalEnrollments", enrollmentRepository.count());
        report.put("enrollmentsByStatus", getEnrollmentStatusDistribution());
        report.put("monthlyTrends", enrollmentRepository.getMonthlyEnrollmentTrends());
        report.put("completionRates", getCompletionRates());
        
        return report;
    }

    // System Health and Monitoring
    @Transactional(readOnly = true)
    public Map<String, Object> getSystemHealth() {
        validateAdminAccess();
        
        Map<String, Object> health = new HashMap<>();
        health.put("timestamp", LocalDateTime.now());
        health.put("status", "UP");
        
        // Database connectivity
        try {
            userRepository.count();
            health.put("database", "UP");
        } catch (Exception e) {
            health.put("database", "DOWN");
            health.put("status", "DOWN");
        }
        
        // Check for pending tasks
        long pendingCertificates = certificateRepository.countByStatus(Certificate.Status.PENDING);
        health.put("pendingCertificates", pendingCertificates);
        
        long pendingReviews = reviewRepository.countByIsPublishedFalse();
        health.put("pendingReviews", pendingReviews);
        
        long pendingComments = commentRepository.countByIsPublishedFalse();
        health.put("pendingComments", pendingComments);
        
        return health;
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "statistics", key = "'system-stats'")
    public Map<String, Object> getSystemStats() {
        validateAdminAccess();
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("timestamp", LocalDateTime.now());
        
        // Entity counts
        stats.put("users", userRepository.count());
        stats.put("courses", courseRepository.count());
        stats.put("enrollments", enrollmentRepository.count());
        stats.put("reviews", reviewRepository.count());
        stats.put("comments", commentRepository.count());
        stats.put("certificates", certificateRepository.count());
        stats.put("notifications", notificationRepository.count());
        
        // Storage usage (placeholder - would need actual implementation)
        stats.put("storageUsed", "N/A");
        stats.put("storageLimit", "N/A");
        
        return stats;
    }

    // Helper methods
    private void validateAdminAccess() {
        User currentUser = getCurrentUser();
        if (!currentUser.isAdmin()) {
            throw new BadRequestException("Admin access required");
        }
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private Map<String, Long> getUserRoleDistribution() {
        Map<String, Long> distribution = new HashMap<>();
        distribution.put("STUDENT", userRepository.countByRole(User.Role.STUDENT));
        distribution.put("INSTRUCTOR", userRepository.countByRole(User.Role.INSTRUCTOR));
        distribution.put("ADMIN", userRepository.countByRole(User.Role.ADMIN));
        return distribution;
    }

    private Map<String, Long> getUserStatusDistribution() {
        Map<String, Long> distribution = new HashMap<>();
        distribution.put("ACTIVE", userRepository.countByIsEnabledTrue());
        distribution.put("INACTIVE", userRepository.countByIsEnabledFalse());
        return distribution;
    }

    private List<User> getRecentRegistrations() {
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
        return userRepository.findByCreatedAtAfterOrderByCreatedAtDesc(sevenDaysAgo);
    }

    private Map<String, Long> getCourseStatusDistribution() {
        Map<String, Long> distribution = new HashMap<>();
        distribution.put("PUBLISHED", courseRepository.countByIsPublishedTrue());
        distribution.put("UNPUBLISHED", courseRepository.countByIsPublishedFalse());
        return distribution;
    }

    private List<Course> getTopRatedCoursesReport() {
        return courseRepository.findTopRatedCourses(
            org.springframework.data.domain.PageRequest.of(0, 10)).getContent();
    }

    private Map<String, Object> getEnrollmentStatusDistribution() {
        Map<String, Object> distribution = new HashMap<>();
        distribution.put("ACTIVE", enrollmentRepository.countByIsActiveTrue());
        distribution.put("INACTIVE", enrollmentRepository.countByIsActiveFalse());
        distribution.put("COMPLETED", enrollmentRepository.countByCompletedAtIsNotNull());
        return distribution;
    }

    private Map<String, Double> getCompletionRates() {
        Map<String, Double> rates = new HashMap<>();
        long totalEnrollments = enrollmentRepository.count();
        long completedEnrollments = enrollmentRepository.countByCompletedAtIsNotNull();

        double completionRate = totalEnrollments > 0 ? (double) completedEnrollments / totalEnrollments * 100 : 0;
        rates.put("overall", completionRate);

        return rates;
    }

    // Additional analytics methods for AdminAnalyticsController
    @Transactional(readOnly = true)
    public Map<String, Object> getTrendAnalytics(int days) {
        validateAdminAccess();

        Map<String, Object> trends = new HashMap<>();
        LocalDateTime startDate = LocalDateTime.now().minusDays(days);

        // User registration trends
        long newUsers = userRepository.countByCreatedAtAfter(startDate);
        trends.put("newUsers", newUsers);

        // Course creation trends
        long newCourses = courseRepository.countByCreatedAtAfter(startDate);
        trends.put("newCourses", newCourses);

        // Enrollment trends
        long newEnrollments = enrollmentRepository.countByEnrolledAtAfter(startDate);
        trends.put("newEnrollments", newEnrollments);

        return trends;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getPerformanceMetrics() {
        validateAdminAccess();

        Map<String, Object> metrics = new HashMap<>();

        // Database performance (placeholder - would need actual monitoring)
        metrics.put("databaseConnections", "N/A");
        metrics.put("averageQueryTime", "N/A");

        // Application performance
        metrics.put("activeUsers", userRepository.countByIsEnabledTrue());
        metrics.put("systemLoad", "N/A");

        return metrics;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getUserActivityAnalytics(LocalDateTime startDate, LocalDateTime endDate) {
        validateAdminAccess();

        Map<String, Object> activity = new HashMap<>();

        if (startDate == null) startDate = LocalDateTime.now().minusDays(30);
        if (endDate == null) endDate = LocalDateTime.now();

        // User activity metrics
        activity.put("period", Map.of("start", startDate, "end", endDate));
        activity.put("activeUsers", userRepository.countByIsEnabledTrue());

        return activity;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getCoursePerformanceAnalytics(Pageable pageable) {
        validateAdminAccess();

        Map<String, Object> performance = new HashMap<>();

        // Top performing courses
        performance.put("topRatedCourses", courseRepository.findTopRatedCourses(pageable).getContent());
        performance.put("mostEnrolledCourses", courseRepository.findMostEnrolledCourses(pageable).getContent());

        return performance;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getInstructorPerformanceAnalytics(Pageable pageable) {
        validateAdminAccess();

        Map<String, Object> performance = new HashMap<>();

        // Top earning instructors
        performance.put("topEarningInstructors", earningsRepository.getTopEarningInstructors(pageable).getContent());

        return performance;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getContentModerationStats() {
        validateAdminAccess();

        Map<String, Object> stats = new HashMap<>();

        stats.put("pendingReviews", reviewRepository.countByIsPublishedFalse());
        stats.put("pendingComments", commentRepository.countByIsPublishedFalse());
        stats.put("pendingCourses", courseRepository.countByIsPublishedFalse());

        return stats;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getSystemUsageStats() {
        validateAdminAccess();

        Map<String, Object> usage = new HashMap<>();

        usage.put("totalUsers", userRepository.count());
        usage.put("totalCourses", courseRepository.count());
        usage.put("totalEnrollments", enrollmentRepository.count());
        usage.put("storageUsed", "N/A"); // Would need actual implementation

        return usage;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> exportUsersData(String format) {
        validateAdminAccess();

        Map<String, Object> export = new HashMap<>();
        export.put("format", format != null ? format : "json");
        export.put("data", userRepository.findAll());
        export.put("exportedAt", LocalDateTime.now());

        return export;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> exportCoursesData(String format) {
        validateAdminAccess();

        Map<String, Object> export = new HashMap<>();
        export.put("format", format != null ? format : "json");
        export.put("data", courseRepository.findAll());
        export.put("exportedAt", LocalDateTime.now());

        return export;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> exportEnrollmentsData(String format) {
        validateAdminAccess();

        Map<String, Object> export = new HashMap<>();
        export.put("format", format != null ? format : "json");
        export.put("data", enrollmentRepository.findAll());
        export.put("exportedAt", LocalDateTime.now());

        return export;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getRealTimeMetrics() {
        validateAdminAccess();

        Map<String, Object> metrics = new HashMap<>();
        metrics.put("timestamp", LocalDateTime.now());
        metrics.put("activeUsers", userRepository.countByIsEnabledTrue());
        metrics.put("onlineUsers", "N/A"); // Would need session tracking

        return metrics;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getSystemAlerts() {
        validateAdminAccess();

        Map<String, Object> alerts = new HashMap<>();

        // Check for system issues
        List<Map<String, Object>> alertList = new ArrayList<>();

        // Check pending certificates
        long pendingCerts = certificateRepository.countByStatus(Certificate.Status.PENDING);
        if (pendingCerts > 10) {
            alertList.add(Map.of(
                "level", "WARNING",
                "message", "High number of pending certificates: " + pendingCerts,
                "timestamp", LocalDateTime.now()
            ));
        }

        alerts.put("alerts", alertList);
        alerts.put("count", alertList.size());

        return alerts;
    }

    public void acknowledgeAlert(String alertId) {
        validateAdminAccess();
        log.info("Alert {} acknowledged by admin", alertId);
        // Implementation would depend on alert storage system
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getMaintenanceInfo() {
        validateAdminAccess();

        Map<String, Object> maintenance = new HashMap<>();
        maintenance.put("scheduledMaintenance", false);
        maintenance.put("nextWindow", null);
        maintenance.put("lastMaintenance", null);

        return maintenance;
    }

    public void scheduleMaintenanceWindow(Map<String, Object> maintenanceRequest) {
        validateAdminAccess();
        log.info("Maintenance window scheduled: {}", maintenanceRequest);
        // Implementation would depend on maintenance scheduling system
    }

    // User Management Methods for AdminUserManagementController
    @Transactional(readOnly = true)
    public Page<com.lms.dto.user.UserDto> getAllUsersWithFilters(String search, User.Role role, Boolean active, Pageable pageable) {
        validateAdminAccess();

        // This would need proper implementation with UserDto mapping
        // For now, returning a placeholder
        return userRepository.findUsersWithFilters(search, role, pageable)
                .map(this::convertToUserDto);
    }

    public com.lms.dto.user.UserDto updateUserAsAdmin(String userId, com.lms.dto.user.UserDto userDto) {
        validateAdminAccess();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Update user fields
        if (userDto.getFirstName() != null) user.setFirstName(userDto.getFirstName());
        if (userDto.getLastName() != null) user.setLastName(userDto.getLastName());
        if (userDto.getEmail() != null) user.setEmail(userDto.getEmail());

        User savedUser = userRepository.save(user);
        log.info("User {} updated by admin", savedUser.getEmail());

        return convertToUserDto(savedUser);
    }

    public void activateUser(String userId) {
        validateAdminAccess();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setEnabled(true);
        userRepository.save(user);
        log.info("User {} activated by admin", user.getEmail());
    }

    public void deactivateUser(String userId) {
        validateAdminAccess();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setEnabled(false);
        userRepository.save(user);
        log.info("User {} deactivated by admin", user.getEmail());
    }

    public com.lms.dto.user.UserDto changeUserRole(String userId, User.Role newRole) {
        validateAdminAccess();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        User.Role oldRole = user.getRole();
        user.setRole(newRole);

        // If changing to instructor, set approval status
        if (newRole == User.Role.INSTRUCTOR) {
            user.setApproved(false);
        }

        User savedUser = userRepository.save(user);
        log.info("User {} role changed from {} to {} by admin", user.getEmail(), oldRole, newRole);

        return convertToUserDto(savedUser);
    }

    public void deleteUserAsAdmin(String userId) {
        validateAdminAccess();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Check if user has dependencies
        long enrollmentCount = enrollmentRepository.countByUser(user);
        if (enrollmentCount > 0) {
            throw new BadRequestException("Cannot delete user with active enrollments");
        }

        userRepository.delete(user);
        log.info("User {} deleted by admin", user.getEmail());
    }

    @Transactional(readOnly = true)
    public Page<com.lms.dto.user.UserDto> getPendingInstructors(Pageable pageable) {
        validateAdminAccess();

        return userRepository.findByRoleAndIsApproved(User.Role.INSTRUCTOR, false, pageable)
                .map(this::convertToUserDto);
    }

    public void approveInstructor(String instructorId) {
        validateAdminAccess();

        User instructor = userRepository.findById(instructorId)
                .orElseThrow(() -> new ResourceNotFoundException("Instructor not found"));

        if (instructor.getRole() != User.Role.INSTRUCTOR) {
            throw new BadRequestException("User is not an instructor");
        }

        instructor.setApproved(true);
        userRepository.save(instructor);

        // Send approval notification
        try {
            messagingService.sendInstructorApprovedEmail(instructor);
        } catch (Exception e) {
            log.error("Failed to send instructor approval email", e);
        }

        log.info("Instructor {} approved by admin", instructor.getEmail());
    }

    public void rejectInstructor(String instructorId, String reason) {
        validateAdminAccess();

        User instructor = userRepository.findById(instructorId)
                .orElseThrow(() -> new ResourceNotFoundException("Instructor not found"));

        if (instructor.getRole() != User.Role.INSTRUCTOR) {
            throw new BadRequestException("User is not an instructor");
        }

        // Change role back to student
        instructor.setRole(User.Role.STUDENT);
        instructor.setApproved(false);
        userRepository.save(instructor);

        // Send rejection notification
        try {
            messagingService.sendInstructorRejectedEmail(instructor, reason);
        } catch (Exception e) {
            log.error("Failed to send instructor rejection email", e);
        }

        log.info("Instructor {} rejected by admin", instructor.getEmail());
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getUserStats() {
        validateAdminAccess();
        return getUserAnalytics();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getUserActivity(int days) {
        validateAdminAccess();
        return getTrendAnalytics(days);
    }

    public void performBulkUserAction(Map<String, Object> bulkRequest) {
        validateAdminAccess();
        log.info("Performing bulk user action: {}", bulkRequest);
        // Implementation would depend on the specific bulk actions needed
    }

    @Transactional(readOnly = true)
    public Page<com.lms.dto.user.UserDto> searchUsers(String query, Pageable pageable) {
        validateAdminAccess();

        return userRepository.findUsersWithFilters(query, null, pageable)
                .map(this::convertToUserDto);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> exportUsers(String format) {
        validateAdminAccess();
        return exportUsersData(format);
    }

    public void sendNotificationToUsers(Map<String, Object> notificationRequest) {
        validateAdminAccess();

        String title = (String) notificationRequest.get("title");
        String message = (String) notificationRequest.get("message");

        broadcastSystemNotification(title, message);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getUserActivityLog(String userId, Pageable pageable) {
        validateAdminAccess();

        Map<String, Object> activityLog = new HashMap<>();
        activityLog.put("userId", userId);
        activityLog.put("activities", new ArrayList<>()); // Would need actual activity tracking

        return activityLog;
    }

    public void resetUserPassword(String userId) {
        validateAdminAccess();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Generate reset token and send email
        String resetToken = UUID.randomUUID().toString();
        user.setResetPasswordToken(resetToken);
        userRepository.save(user);

        try {
            messagingService.sendPasswordResetEmail(user, resetToken);
        } catch (Exception e) {
            log.error("Failed to send password reset email", e);
        }

        log.info("Password reset initiated for user {} by admin", user.getEmail());
    }

    public void verifyUserEmail(String userId) {
        validateAdminAccess();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setEmailVerified(true);
        user.setVerificationToken(null);
        userRepository.save(user);

        log.info("Email verified for user {} by admin", user.getEmail());
    }

    // Helper method to convert User to UserDto
    private com.lms.dto.user.UserDto convertToUserDto(User user) {
        com.lms.dto.user.UserDto dto = new com.lms.dto.user.UserDto();
        dto.setId(user.getId());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        dto.setEnabled(user.isEnabled());
        dto.setEmailVerified(user.isEmailVerified());
        dto.setCreatedAt(user.getCreatedAt());
        return dto;
    }
}
