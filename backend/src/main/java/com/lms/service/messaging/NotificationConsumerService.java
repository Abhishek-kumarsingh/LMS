package com.lms.service.messaging;

import com.lms.config.RabbitMQConfig;
import com.lms.dto.messaging.NotificationMessage;
import com.lms.entity.Notification;
import com.lms.repository.NotificationRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationConsumerService {

    private final NotificationRepository notificationRepository;

    @RabbitListener(queues = RabbitMQConfig.NOTIFICATION_QUEUE)
    public void processNotificationMessage(NotificationMessage notificationMessage) {
        try {
            log.info("Processing notification message: {} for user {}", 
                    notificationMessage.getType(), notificationMessage.getUserId());
            
            // Create and save notification entity
            Notification notification = new Notification();
            notification.setId(UUID.randomUUID().toString());
            notification.setUserId(notificationMessage.getUserId());
            notification.setTitle(notificationMessage.getTitle());
            notification.setMessage(notificationMessage.getMessage());
            notification.setType(mapNotificationType(notificationMessage.getType()));
            notification.setRead(false);
            notification.setCreatedAt(notificationMessage.getCreatedAt());
            
            if (notificationMessage.getData() != null) {
                // Store additional data as JSON string or in separate fields
                notification.setMetadata(notificationMessage.getData().toString());
            }
            
            notificationRepository.save(notification);
            
            log.info("Notification saved successfully for user: {}", notificationMessage.getUserId());
            
            // Here you could also implement real-time notification delivery
            // via WebSocket, Server-Sent Events, or push notifications
            sendRealTimeNotification(notification);
            
        } catch (Exception e) {
            log.error("Failed to process notification message: {}", notificationMessage.getId(), e);
            // Could implement retry logic or dead letter queue
        }
    }
    
    private Notification.NotificationType mapNotificationType(NotificationMessage.NotificationType messageType) {
        return switch (messageType) {
            case COURSE_ENROLLMENT -> Notification.NotificationType.COURSE_ENROLLMENT;
            case COURSE_COMPLETION -> Notification.NotificationType.COURSE_COMPLETION;
            case CERTIFICATE_READY -> Notification.NotificationType.CERTIFICATE_READY;
            case NEW_COURSE_PUBLISHED -> Notification.NotificationType.NEW_COURSE_PUBLISHED;
            case COURSE_UPDATED -> Notification.NotificationType.COURSE_UPDATED;
            case REVIEW_RECEIVED -> Notification.NotificationType.REVIEW_RECEIVED;
            case COMMENT_RECEIVED -> Notification.NotificationType.COMMENT_RECEIVED;
            case INSTRUCTOR_APPROVED -> Notification.NotificationType.INSTRUCTOR_APPROVED;
            case SYSTEM_ANNOUNCEMENT -> Notification.NotificationType.SYSTEM_ANNOUNCEMENT;
        };
    }
    
    private void sendRealTimeNotification(Notification notification) {
        // Implement real-time notification delivery
        // This could be WebSocket, Server-Sent Events, or push notifications
        log.info("Real-time notification sent for user: {}", notification.getUserId());
        
        // Example: WebSocket implementation would go here
        // webSocketService.sendNotificationToUser(notification.getUserId(), notification);
        
        // Example: Server-Sent Events implementation would go here
        // sseService.sendEventToUser(notification.getUserId(), notification);
    }
}
