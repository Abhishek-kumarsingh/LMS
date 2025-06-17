package com.lms.service;

import com.lms.entity.Notification;
import com.lms.entity.User;
import com.lms.exception.BadRequestException;
import com.lms.exception.ResourceNotFoundException;
import com.lms.repository.NotificationRepository;
import com.lms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public Page<Notification> getUserNotifications(Pageable pageable) {
        User currentUser = getCurrentUser();
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId(), pageable);
    }

    @Transactional(readOnly = true)
    public Page<Notification> getUserUnreadNotifications(Pageable pageable) {
        User currentUser = getCurrentUser();
        return notificationRepository.findByUserIdAndReadFalseOrderByCreatedAtDesc(currentUser.getId(), pageable);
    }

    @Transactional(readOnly = true)
    public Page<Notification> getUserNotificationsByType(Notification.NotificationType type, Pageable pageable) {
        User currentUser = getCurrentUser();
        return notificationRepository.findByUserIdAndTypeOrderByCreatedAtDesc(currentUser.getId(), type, pageable);
    }

    @Transactional(readOnly = true)
    public long getUserNotificationCount() {
        User currentUser = getCurrentUser();
        return notificationRepository.countByUserId(currentUser.getId());
    }

    @Transactional(readOnly = true)
    public long getUserUnreadNotificationCount() {
        User currentUser = getCurrentUser();
        return notificationRepository.countByUserIdAndReadFalse(currentUser.getId());
    }

    @Transactional(readOnly = true)
    public Object[] getUserNotificationStats() {
        User currentUser = getCurrentUser();
        return notificationRepository.getNotificationStats(currentUser.getId());
    }

    public Notification markAsRead(String notificationId) {
        Notification notification = getNotificationById(notificationId);
        User currentUser = getCurrentUser();

        // Check if user owns this notification
        if (!notification.getUserId().equals(currentUser.getId())) {
            throw new BadRequestException("You can only mark your own notifications as read");
        }

        if (!notification.isRead()) {
            notification.markAsRead();
            notification = notificationRepository.save(notification);
            log.info("Notification marked as read: {} for user: {}", notificationId, currentUser.getEmail());
        }

        return notification;
    }

    public void markAllAsRead() {
        User currentUser = getCurrentUser();
        notificationRepository.markAllAsReadByUserId(currentUser.getId(), LocalDateTime.now());
        log.info("All notifications marked as read for user: {}", currentUser.getEmail());
    }

    public void deleteNotification(String notificationId) {
        Notification notification = getNotificationById(notificationId);
        User currentUser = getCurrentUser();

        // Check if user owns this notification
        if (!notification.getUserId().equals(currentUser.getId())) {
            throw new BadRequestException("You can only delete your own notifications");
        }

        notificationRepository.delete(notification);
        log.info("Notification deleted: {} by user: {}", notificationId, currentUser.getEmail());
    }

    @Transactional(readOnly = true)
    public Notification getNotificationById(String notificationId) {
        return notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
    }

    // Admin methods
    @Transactional(readOnly = true)
    public Page<Notification> getAllNotifications(Pageable pageable) {
        User currentUser = getCurrentUser();
        
        if (!currentUser.isAdmin()) {
            throw new BadRequestException("Only admins can view all notifications");
        }

        return notificationRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public Page<Notification> getNotificationsByType(Notification.NotificationType type, Pageable pageable) {
        User currentUser = getCurrentUser();
        
        if (!currentUser.isAdmin()) {
            throw new BadRequestException("Only admins can view notifications by type");
        }

        return notificationRepository.findByTypeOrderByCreatedAtDesc(type, pageable);
    }

    @Transactional(readOnly = true)
    public Page<Notification> getRecentNotifications(LocalDateTime since, Pageable pageable) {
        User currentUser = getCurrentUser();
        
        if (!currentUser.isAdmin()) {
            throw new BadRequestException("Only admins can view recent notifications");
        }

        return notificationRepository.findByCreatedAtAfterOrderByCreatedAtDesc(since, pageable);
    }

    // Scheduled cleanup of old read notifications (runs daily at 2 AM)
    @Scheduled(cron = "0 0 2 * * ?")
    public void cleanupOldNotifications() {
        try {
            LocalDateTime cutoffDate = LocalDateTime.now().minusDays(30); // Keep notifications for 30 days
            notificationRepository.deleteOldReadNotifications(cutoffDate);
            log.info("Cleaned up old read notifications older than {}", cutoffDate);
        } catch (Exception e) {
            log.error("Failed to cleanup old notifications", e);
        }
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
