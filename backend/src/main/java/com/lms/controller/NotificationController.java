package com.lms.controller;

import com.lms.entity.Notification;
import com.lms.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/my-notifications")
    @PreAuthorize("hasRole('STUDENT') or hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Page<Notification>> getUserNotifications(@PageableDefault(size = 20) Pageable pageable) {
        Page<Notification> notifications = notificationService.getUserNotifications(pageable);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/my-notifications/unread")
    @PreAuthorize("hasRole('STUDENT') or hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Page<Notification>> getUserUnreadNotifications(@PageableDefault(size = 20) Pageable pageable) {
        Page<Notification> notifications = notificationService.getUserUnreadNotifications(pageable);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/my-notifications/count")
    @PreAuthorize("hasRole('STUDENT') or hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Long> getUserNotificationCount() {
        long count = notificationService.getUserNotificationCount();
        return ResponseEntity.ok(count);
    }

    @GetMapping("/my-notifications/unread/count")
    @PreAuthorize("hasRole('STUDENT') or hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Long> getUserUnreadNotificationCount() {
        long count = notificationService.getUserUnreadNotificationCount();
        return ResponseEntity.ok(count);
    }

    @PutMapping("/{notificationId}/mark-read")
    @PreAuthorize("hasRole('STUDENT') or hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Notification> markNotificationAsRead(@PathVariable String notificationId) {
        Notification notification = notificationService.markAsRead(notificationId);
        return ResponseEntity.ok(notification);
    }

    @PutMapping("/mark-all-read")
    @PreAuthorize("hasRole('STUDENT') or hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Void> markAllNotificationsAsRead() {
        notificationService.markAllAsRead();
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{notificationId}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Void> deleteNotification(@PathVariable String notificationId) {
        notificationService.deleteNotification(notificationId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/my-notifications/type/{type}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Page<Notification>> getUserNotificationsByType(@PathVariable Notification.NotificationType type,
                                                                        @PageableDefault(size = 20) Pageable pageable) {
        Page<Notification> notifications = notificationService.getUserNotificationsByType(type, pageable);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/my-notifications/stats")
    @PreAuthorize("hasRole('STUDENT') or hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Object[]> getUserNotificationStats() {
        Object[] stats = notificationService.getUserNotificationStats();
        return ResponseEntity.ok(stats);
    }
}
