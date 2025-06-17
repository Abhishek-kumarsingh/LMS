package com.lms.controller;

import com.lms.dto.admin.DashboardAnalyticsDto;
import com.lms.dto.admin.SystemHealthDto;
import com.lms.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/analytics")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
@PreAuthorize("hasRole('ADMIN')")
public class AdminAnalyticsController {

    private final AdminService adminService;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardAnalytics() {
        Map<String, Object> analytics = adminService.getDashboardAnalytics();
        return ResponseEntity.ok(analytics);
    }

    @GetMapping("/users")
    public ResponseEntity<Map<String, Object>> getUserAnalytics() {
        Map<String, Object> analytics = adminService.getUserAnalytics();
        return ResponseEntity.ok(analytics);
    }

    @GetMapping("/courses")
    public ResponseEntity<Map<String, Object>> getCourseAnalytics() {
        Map<String, Object> analytics = adminService.getCourseAnalytics();
        return ResponseEntity.ok(analytics);
    }

    @GetMapping("/enrollments")
    public ResponseEntity<Map<String, Object>> getEnrollmentAnalytics() {
        Map<String, Object> analytics = adminService.getEnrollmentAnalytics();
        return ResponseEntity.ok(analytics);
    }

    @GetMapping("/revenue")
    public ResponseEntity<Map<String, Object>> getRevenueAnalytics() {
        Map<String, Object> analytics = adminService.getRevenueAnalytics();
        return ResponseEntity.ok(analytics);
    }

    @GetMapping("/trends")
    public ResponseEntity<Map<String, Object>> getTrendAnalytics(
            @RequestParam(defaultValue = "30") int days) {
        Map<String, Object> trends = adminService.getTrendAnalytics(days);
        return ResponseEntity.ok(trends);
    }

    @GetMapping("/performance")
    public ResponseEntity<Map<String, Object>> getPerformanceMetrics() {
        Map<String, Object> metrics = adminService.getPerformanceMetrics();
        return ResponseEntity.ok(metrics);
    }

    @GetMapping("/user-activity")
    public ResponseEntity<Map<String, Object>> getUserActivityAnalytics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        Map<String, Object> activity = adminService.getUserActivityAnalytics(startDate, endDate);
        return ResponseEntity.ok(activity);
    }

    @GetMapping("/course-performance")
    public ResponseEntity<Map<String, Object>> getCoursePerformanceAnalytics(
            @PageableDefault(size = 20) Pageable pageable) {
        Map<String, Object> performance = adminService.getCoursePerformanceAnalytics(pageable);
        return ResponseEntity.ok(performance);
    }

    @GetMapping("/instructor-performance")
    public ResponseEntity<Map<String, Object>> getInstructorPerformanceAnalytics(
            @PageableDefault(size = 20) Pageable pageable) {
        Map<String, Object> performance = adminService.getInstructorPerformanceAnalytics(pageable);
        return ResponseEntity.ok(performance);
    }

    @GetMapping("/content-moderation")
    public ResponseEntity<Map<String, Object>> getContentModerationStats() {
        Map<String, Object> stats = adminService.getContentModerationStats();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/system-usage")
    public ResponseEntity<Map<String, Object>> getSystemUsageStats() {
        Map<String, Object> usage = adminService.getSystemUsageStats();
        return ResponseEntity.ok(usage);
    }

    @GetMapping("/export/users")
    public ResponseEntity<Map<String, Object>> exportUsersData(
            @RequestParam(required = false) String format) {
        Map<String, Object> export = adminService.exportUsersData(format);
        return ResponseEntity.ok(export);
    }

    @GetMapping("/export/courses")
    public ResponseEntity<Map<String, Object>> exportCoursesData(
            @RequestParam(required = false) String format) {
        Map<String, Object> export = adminService.exportCoursesData(format);
        return ResponseEntity.ok(export);
    }

    @GetMapping("/export/enrollments")
    public ResponseEntity<Map<String, Object>> exportEnrollmentsData(
            @RequestParam(required = false) String format) {
        Map<String, Object> export = adminService.exportEnrollmentsData(format);
        return ResponseEntity.ok(export);
    }

    @GetMapping("/real-time")
    public ResponseEntity<Map<String, Object>> getRealTimeMetrics() {
        Map<String, Object> metrics = adminService.getRealTimeMetrics();
        return ResponseEntity.ok(metrics);
    }

    @GetMapping("/alerts")
    public ResponseEntity<Map<String, Object>> getSystemAlerts() {
        Map<String, Object> alerts = adminService.getSystemAlerts();
        return ResponseEntity.ok(alerts);
    }

    @PostMapping("/alerts/{alertId}/acknowledge")
    public ResponseEntity<Map<String, String>> acknowledgeAlert(@PathVariable String alertId) {
        adminService.acknowledgeAlert(alertId);
        return ResponseEntity.ok(Map.of("message", "Alert acknowledged successfully"));
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> getSystemHealth() {
        Map<String, Object> health = adminService.getSystemHealth();
        return ResponseEntity.ok(health);
    }

    @GetMapping("/maintenance")
    public ResponseEntity<Map<String, Object>> getMaintenanceInfo() {
        Map<String, Object> maintenance = adminService.getMaintenanceInfo();
        return ResponseEntity.ok(maintenance);
    }

    @PostMapping("/maintenance/schedule")
    public ResponseEntity<Map<String, String>> scheduleMaintenanceWindow(
            @RequestBody Map<String, Object> maintenanceRequest) {
        adminService.scheduleMaintenanceWindow(maintenanceRequest);
        return ResponseEntity.ok(Map.of("message", "Maintenance window scheduled successfully"));
    }
}
