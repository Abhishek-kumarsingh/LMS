package com.lms.repository;

import com.lms.entity.InAppMessage;
import com.lms.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface InAppMessageRepository extends JpaRepository<InAppMessage, String> {
    
    // Find messages for a specific recipient
    Page<InAppMessage> findByRecipientOrderByCreatedAtDesc(User recipient, Pageable pageable);
    
    // Find unread messages for a recipient
    Page<InAppMessage> findByRecipientAndIsReadFalseOrderByCreatedAtDesc(User recipient, Pageable pageable);
    
    // Find messages by type for a recipient
    Page<InAppMessage> findByRecipientAndTypeOrderByCreatedAtDesc(User recipient, InAppMessage.MessageType type, Pageable pageable);
    
    // Find messages by priority for a recipient
    Page<InAppMessage> findByRecipientAndPriorityOrderByCreatedAtDesc(User recipient, InAppMessage.Priority priority, Pageable pageable);
    
    // Count unread messages for a recipient
    @Query("SELECT COUNT(m) FROM InAppMessage m WHERE m.recipient = :recipient AND m.isRead = false")
    long countUnreadMessages(@Param("recipient") User recipient);
    
    // Count unread messages by type for a recipient
    @Query("SELECT COUNT(m) FROM InAppMessage m WHERE m.recipient = :recipient AND m.isRead = false AND m.type = :type")
    long countUnreadMessagesByType(@Param("recipient") User recipient, @Param("type") InAppMessage.MessageType type);
    
    // Find messages sent by a specific sender
    Page<InAppMessage> findBySenderOrderByCreatedAtDesc(User sender, Pageable pageable);
    
    // Find messages related to a specific course
    @Query("SELECT m FROM InAppMessage m WHERE m.relatedCourse.id = :courseId ORDER BY m.createdAt DESC")
    Page<InAppMessage> findByCourseId(@Param("courseId") String courseId, Pageable pageable);
    
    // Find expired messages
    @Query("SELECT m FROM InAppMessage m WHERE m.expiresAt IS NOT NULL AND m.expiresAt < :now")
    List<InAppMessage> findExpiredMessages(@Param("now") LocalDateTime now);
    
    // Mark all messages as read for a recipient
    @Modifying
    @Query("UPDATE InAppMessage m SET m.isRead = true, m.readAt = :readAt WHERE m.recipient = :recipient AND m.isRead = false")
    void markAllAsReadForRecipient(@Param("recipient") User recipient, @Param("readAt") LocalDateTime readAt);
    
    // Mark messages of specific type as read for a recipient
    @Modifying
    @Query("UPDATE InAppMessage m SET m.isRead = true, m.readAt = :readAt WHERE m.recipient = :recipient AND m.type = :type AND m.isRead = false")
    void markTypeAsReadForRecipient(@Param("recipient") User recipient, @Param("type") InAppMessage.MessageType type, @Param("readAt") LocalDateTime readAt);
    
    // Delete expired messages
    @Modifying
    @Query("DELETE FROM InAppMessage m WHERE m.expiresAt IS NOT NULL AND m.expiresAt < :now")
    void deleteExpiredMessages(@Param("now") LocalDateTime now);
    
    // Find recent messages for a recipient (last 30 days)
    @Query("SELECT m FROM InAppMessage m WHERE m.recipient = :recipient AND m.createdAt >= :since ORDER BY m.createdAt DESC")
    List<InAppMessage> findRecentMessages(@Param("recipient") User recipient, @Param("since") LocalDateTime since);
    
    // Find high priority unread messages
    @Query("SELECT m FROM InAppMessage m WHERE m.recipient = :recipient AND m.isRead = false AND m.priority IN ('HIGH', 'URGENT') ORDER BY m.priority DESC, m.createdAt DESC")
    List<InAppMessage> findHighPriorityUnreadMessages(@Param("recipient") User recipient);
    
    // Find messages with actions for a recipient
    @Query("SELECT m FROM InAppMessage m WHERE m.recipient = :recipient AND m.actionUrl IS NOT NULL ORDER BY m.createdAt DESC")
    Page<InAppMessage> findMessagesWithActions(@Param("recipient") User recipient, Pageable pageable);
    
    // Get message statistics for a recipient
    @Query("""
        SELECT 
            COUNT(m) as total,
            SUM(CASE WHEN m.isRead = false THEN 1 ELSE 0 END) as unread,
            SUM(CASE WHEN m.priority = 'HIGH' OR m.priority = 'URGENT' THEN 1 ELSE 0 END) as highPriority,
            SUM(CASE WHEN m.actionUrl IS NOT NULL THEN 1 ELSE 0 END) as withActions
        FROM InAppMessage m 
        WHERE m.recipient = :recipient
        """)
    Object[] getMessageStatistics(@Param("recipient") User recipient);
    
    // Find messages by multiple types
    @Query("SELECT m FROM InAppMessage m WHERE m.recipient = :recipient AND m.type IN :types ORDER BY m.createdAt DESC")
    Page<InAppMessage> findByRecipientAndTypeIn(@Param("recipient") User recipient, @Param("types") List<InAppMessage.MessageType> types, Pageable pageable);
    
    // Find system announcements for all users (broadcast messages)
    @Query("SELECT m FROM InAppMessage m WHERE m.type = 'SYSTEM_ANNOUNCEMENT' AND m.createdAt >= :since ORDER BY m.createdAt DESC")
    List<InAppMessage> findSystemAnnouncements(@Param("since") LocalDateTime since);
}
