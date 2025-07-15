package com.lms.service;

import com.lms.entity.*;
import com.lms.exception.ResourceNotFoundException;
import com.lms.repository.InAppMessageRepository;
import com.lms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class InAppMessageService {

    private final InAppMessageRepository messageRepository;
    private final UserRepository userRepository;

    /**
     * Send a message to a specific user
     */
    @Transactional
    public InAppMessage sendMessage(String recipientId, String subject, String content, 
                                   InAppMessage.MessageType type, InAppMessage.Priority priority,
                                   String senderId, String actionUrl, String actionText,
                                   Map<String, String> metadata) {
        
        User recipient = userRepository.findById(recipientId)
                .orElseThrow(() -> new ResourceNotFoundException("Recipient not found"));
        
        User sender = null;
        if (senderId != null) {
            sender = userRepository.findById(senderId)
                    .orElseThrow(() -> new ResourceNotFoundException("Sender not found"));
        }
        
        InAppMessage message = new InAppMessage();
        message.setId(UUID.randomUUID().toString());
        message.setRecipient(recipient);
        message.setSender(sender);
        message.setSubject(subject);
        message.setContent(content);
        message.setType(type);
        message.setPriority(priority);
        message.setActionUrl(actionUrl);
        message.setActionText(actionText);
        message.setMetadata(metadata != null ? metadata : new HashMap<>());
        
        // Set expiration for certain message types
        if (type == InAppMessage.MessageType.COURSE_REMINDER) {
            message.setExpiresAt(LocalDateTime.now().plusDays(7));
        } else if (type == InAppMessage.MessageType.SYSTEM_ANNOUNCEMENT) {
            message.setExpiresAt(LocalDateTime.now().plusDays(30));
        }
        
        InAppMessage savedMessage = messageRepository.save(message);
        
        log.info("Sent in-app message to user {}: {}", recipientId, subject);
        return savedMessage;
    }

    /**
     * Send enrollment confirmation message
     */
    @Transactional
    public void sendEnrollmentConfirmation(User student, Course course) {
        String subject = "Course Enrollment Confirmed";
        String content = String.format(
            "You have successfully enrolled in '%s' by %s. Start learning now!",
            course.getTitle(), course.getInstructor().getFullName()
        );
        
        Map<String, String> metadata = new HashMap<>();
        metadata.put("courseId", course.getId());
        metadata.put("courseName", course.getTitle());
        metadata.put("instructorId", course.getInstructor().getId());
        
        sendMessage(
            student.getId(),
            subject,
            content,
            InAppMessage.MessageType.ENROLLMENT_CONFIRMATION,
            InAppMessage.Priority.NORMAL,
            null, // System message
            "/courses/" + course.getId(),
            "Start Learning",
            metadata
        );
    }

    /**
     * Send certificate ready notification
     */
    @Transactional
    public void sendCertificateReady(User student, Course course, String certificateNumber) {
        String subject = "🏆 Certificate Ready!";
        String content = String.format(
            "Congratulations! Your certificate for '%s' is ready for download. Certificate #%s",
            course.getTitle(), certificateNumber
        );
        
        Map<String, String> metadata = new HashMap<>();
        metadata.put("courseId", course.getId());
        metadata.put("certificateNumber", certificateNumber);
        
        sendMessage(
            student.getId(),
            subject,
            content,
            InAppMessage.MessageType.CERTIFICATE_READY,
            InAppMessage.Priority.HIGH,
            null,
            "/dashboard/certificates",
            "Download Certificate",
            metadata
        );
    }

    /**
     * Send assignment due reminder
     */
    @Transactional
    public void sendAssignmentDueReminder(User student, Course course, String assignmentTitle, LocalDateTime dueDate) {
        String subject = "📝 Assignment Due Soon";
        String content = String.format(
            "Reminder: '%s' in course '%s' is due on %s",
            assignmentTitle, course.getTitle(), dueDate.toString()
        );
        
        Map<String, String> metadata = new HashMap<>();
        metadata.put("courseId", course.getId());
        metadata.put("assignmentTitle", assignmentTitle);
        metadata.put("dueDate", dueDate.toString());
        
        sendMessage(
            student.getId(),
            subject,
            content,
            InAppMessage.MessageType.ASSIGNMENT_DUE,
            InAppMessage.Priority.HIGH,
            null,
            "/courses/" + course.getId() + "/assignments",
            "View Assignment",
            metadata
        );
    }

    /**
     * Send system announcement to all users
     */
    @Transactional
    public void sendSystemAnnouncement(String subject, String content, InAppMessage.Priority priority,
                                     String actionUrl, String actionText) {
        List<User> allUsers = userRepository.findAll();
        
        for (User user : allUsers) {
            sendMessage(
                user.getId(),
                subject,
                content,
                InAppMessage.MessageType.SYSTEM_ANNOUNCEMENT,
                priority,
                null,
                actionUrl,
                actionText,
                null
            );
        }
        
        log.info("Sent system announcement to {} users: {}", allUsers.size(), subject);
    }

    /**
     * Get messages for a user
     */
    public Page<InAppMessage> getMessagesForUser(String userId, Pageable pageable) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        return messageRepository.findByRecipientOrderByCreatedAtDesc(user, pageable);
    }

    /**
     * Get unread messages for a user
     */
    public Page<InAppMessage> getUnreadMessagesForUser(String userId, Pageable pageable) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        return messageRepository.findByRecipientAndIsReadFalseOrderByCreatedAtDesc(user, pageable);
    }

    /**
     * Mark message as read
     */
    @Transactional
    public void markMessageAsRead(String messageId, String userId) {
        InAppMessage message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found"));
        
        if (!message.getRecipient().getId().equals(userId)) {
            throw new IllegalArgumentException("User not authorized to read this message");
        }
        
        if (!message.isRead()) {
            message.markAsRead();
            messageRepository.save(message);
            log.debug("Marked message {} as read for user {}", messageId, userId);
        }
    }

    /**
     * Mark all messages as read for a user
     */
    @Transactional
    public void markAllMessagesAsRead(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        messageRepository.markAllAsReadForRecipient(user, LocalDateTime.now());
        log.info("Marked all messages as read for user {}", userId);
    }

    /**
     * Get unread message count for a user
     */
    public long getUnreadMessageCount(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        return messageRepository.countUnreadMessages(user);
    }

    /**
     * Get high priority unread messages
     */
    public List<InAppMessage> getHighPriorityUnreadMessages(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        return messageRepository.findHighPriorityUnreadMessages(user);
    }

    /**
     * Get message statistics for a user
     */
    public MessageStatistics getMessageStatistics(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        Object[] stats = messageRepository.getMessageStatistics(user);
        
        return new MessageStatistics(
            ((Number) stats[0]).longValue(), // total
            ((Number) stats[1]).longValue(), // unread
            ((Number) stats[2]).longValue(), // high priority
            ((Number) stats[3]).longValue()  // with actions
        );
    }

    /**
     * Clean up expired messages (scheduled task)
     */
    @Scheduled(fixedRate = 3600000) // Run every hour
    @Transactional
    public void cleanupExpiredMessages() {
        LocalDateTime now = LocalDateTime.now();
        List<InAppMessage> expiredMessages = messageRepository.findExpiredMessages(now);
        
        if (!expiredMessages.isEmpty()) {
            messageRepository.deleteExpiredMessages(now);
            log.info("Cleaned up {} expired messages", expiredMessages.size());
        }
    }

    /**
     * Message statistics class
     */
    public static class MessageStatistics {
        private final long totalMessages;
        private final long unreadMessages;
        private final long highPriorityMessages;
        private final long messagesWithActions;

        public MessageStatistics(long totalMessages, long unreadMessages, 
                               long highPriorityMessages, long messagesWithActions) {
            this.totalMessages = totalMessages;
            this.unreadMessages = unreadMessages;
            this.highPriorityMessages = highPriorityMessages;
            this.messagesWithActions = messagesWithActions;
        }

        public long getTotalMessages() { return totalMessages; }
        public long getUnreadMessages() { return unreadMessages; }
        public long getHighPriorityMessages() { return highPriorityMessages; }
        public long getMessagesWithActions() { return messagesWithActions; }
    }
}
