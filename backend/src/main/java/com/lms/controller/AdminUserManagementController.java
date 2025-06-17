package com.lms.controller;

import com.lms.dto.user.UserDto;
import com.lms.entity.User;
import com.lms.service.AdminService;
import com.lms.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserManagementController {

    private final UserService userService;
    private final AdminService adminService;

    @GetMapping
    public ResponseEntity<Page<UserDto>> getAllUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) User.Role role,
            @RequestParam(required = false) Boolean active,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<UserDto> users = adminService.getAllUsersWithFilters(search, role, active, pageable);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<UserDto> getUserById(@PathVariable String userId) {
        UserDto user = userService.getUserById(userId);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/{userId}")
    public ResponseEntity<UserDto> updateUser(@PathVariable String userId,
                                            @RequestBody UserDto userDto) {
        UserDto updatedUser = adminService.updateUserAsAdmin(userId, userDto);
        return ResponseEntity.ok(updatedUser);
    }

    @PutMapping("/{userId}/activate")
    public ResponseEntity<Map<String, String>> activateUser(@PathVariable String userId) {
        adminService.activateUser(userId);
        return ResponseEntity.ok(Map.of("message", "User activated successfully"));
    }

    @PutMapping("/{userId}/deactivate")
    public ResponseEntity<Map<String, String>> deactivateUser(@PathVariable String userId) {
        adminService.deactivateUser(userId);
        return ResponseEntity.ok(Map.of("message", "User deactivated successfully"));
    }

    @PutMapping("/{userId}/role")
    public ResponseEntity<UserDto> changeUserRole(@PathVariable String userId,
                                                 @RequestParam User.Role newRole) {
        UserDto updatedUser = adminService.changeUserRole(userId, newRole);
        return ResponseEntity.ok(updatedUser);
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable String userId) {
        adminService.deleteUserAsAdmin(userId);
        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }

    @GetMapping("/instructors/pending")
    public ResponseEntity<Page<UserDto>> getPendingInstructors(@PageableDefault(size = 20) Pageable pageable) {
        Page<UserDto> pendingInstructors = adminService.getPendingInstructors(pageable);
        return ResponseEntity.ok(pendingInstructors);
    }

    @PutMapping("/instructors/{instructorId}/approve")
    public ResponseEntity<Map<String, String>> approveInstructor(@PathVariable String instructorId) {
        adminService.approveInstructor(instructorId);
        return ResponseEntity.ok(Map.of("message", "Instructor approved successfully"));
    }

    @PutMapping("/instructors/{instructorId}/reject")
    public ResponseEntity<Map<String, String>> rejectInstructor(@PathVariable String instructorId,
                                                              @RequestParam(required = false) String reason) {
        adminService.rejectInstructor(instructorId, reason);
        return ResponseEntity.ok(Map.of("message", "Instructor rejected successfully"));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getUserStats() {
        Map<String, Object> stats = adminService.getUserStats();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/activity")
    public ResponseEntity<Map<String, Object>> getUserActivity(
            @RequestParam(defaultValue = "30") int days) {
        Map<String, Object> activity = adminService.getUserActivity(days);
        return ResponseEntity.ok(activity);
    }

    @PostMapping("/bulk-action")
    public ResponseEntity<Map<String, String>> performBulkAction(
            @RequestBody Map<String, Object> bulkRequest) {
        adminService.performBulkUserAction(bulkRequest);
        return ResponseEntity.ok(Map.of("message", "Bulk action completed successfully"));
    }

    @GetMapping("/search")
    public ResponseEntity<Page<UserDto>> searchUsers(
            @RequestParam String query,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<UserDto> users = adminService.searchUsers(query, pageable);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/export")
    public ResponseEntity<Map<String, Object>> exportUsers(
            @RequestParam(defaultValue = "csv") String format) {
        Map<String, Object> export = adminService.exportUsers(format);
        return ResponseEntity.ok(export);
    }

    @PostMapping("/send-notification")
    public ResponseEntity<Map<String, String>> sendNotificationToUsers(
            @RequestBody Map<String, Object> notificationRequest) {
        adminService.sendNotificationToUsers(notificationRequest);
        return ResponseEntity.ok(Map.of("message", "Notifications sent successfully"));
    }

    @GetMapping("/{userId}/activity-log")
    public ResponseEntity<Map<String, Object>> getUserActivityLog(@PathVariable String userId,
                                                                @PageableDefault(size = 20) Pageable pageable) {
        Map<String, Object> activityLog = adminService.getUserActivityLog(userId, pageable);
        return ResponseEntity.ok(activityLog);
    }

    @PutMapping("/{userId}/reset-password")
    public ResponseEntity<Map<String, String>> resetUserPassword(@PathVariable String userId) {
        adminService.resetUserPassword(userId);
        return ResponseEntity.ok(Map.of("message", "Password reset email sent to user"));
    }

    @PutMapping("/{userId}/verify-email")
    public ResponseEntity<Map<String, String>> verifyUserEmail(@PathVariable String userId) {
        adminService.verifyUserEmail(userId);
        return ResponseEntity.ok(Map.of("message", "User email verified successfully"));
    }
}
