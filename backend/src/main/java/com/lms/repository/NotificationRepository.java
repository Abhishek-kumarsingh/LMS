package com.lms.repository;

import com.lms.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, String> {
    
    // Find notifications by user
    Page<Notification> findByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);
    
    // Find unread notifications by user
    Page<Notification> findByUserIdAndReadFalseOrderByCreatedAtDesc(String userId, Pageable pageable);
    
    // Find notifications by user and type
    Page<Notification> findByUserIdAndTypeOrderByCreatedAtDesc(String userId, Notification.NotificationType type, Pageable pageable);
    
    // Count unread notifications by user
    long countByUserIdAndReadFalse(String userId);
    
    // Count total notifications by user
    long countByUserId(String userId);
    
    // Find recent notifications
    Page<Notification> findByCreatedAtAfterOrderByCreatedAtDesc(LocalDateTime since, Pageable pageable);
    
    // Find notifications by type
    Page<Notification> findByTypeOrderByCreatedAtDesc(Notification.NotificationType type, Pageable pageable);
    
    // Mark all notifications as read for user
    @Query("UPDATE Notification n SET n.read = true, n.readAt = :readAt WHERE n.userId = :userId AND n.read = false")
    void markAllAsReadByUserId(@Param("userId") String userId, @Param("readAt") LocalDateTime readAt);
    
    // Delete old read notifications
    @Query("DELETE FROM Notification n WHERE n.read = true AND n.readAt < :cutoffDate")
    void deleteOldReadNotifications(@Param("cutoffDate") LocalDateTime cutoffDate);
    
    // Find notifications by user in date range
    @Query("SELECT n FROM Notification n WHERE n.userId = :userId AND n.createdAt BETWEEN :startDate AND :endDate ORDER BY n.createdAt DESC")
    Page<Notification> findByUserIdAndDateRange(@Param("userId") String userId, 
                                              @Param("startDate") LocalDateTime startDate, 
                                              @Param("endDate") LocalDateTime endDate, 
                                              Pageable pageable);
    
    // Get notification statistics for user
    @Query("SELECT COUNT(n), COUNT(CASE WHEN n.read = false THEN 1 END) FROM Notification n WHERE n.userId = :userId")
    Object[] getNotificationStats(@Param("userId") String userId);
}
