package com.lms.service.messaging;

import com.lms.config.RabbitMQConfig;
import com.lms.dto.messaging.CertificateMessage;
import com.lms.dto.messaging.EmailMessage;
import com.lms.dto.messaging.NotificationMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class MessageProducerService {

    private final RabbitTemplate rabbitTemplate;

    public void sendEmailMessage(EmailMessage emailMessage) {
        try {
            emailMessage.setId(UUID.randomUUID().toString());
            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.LMS_EXCHANGE,
                    RabbitMQConfig.EMAIL_ROUTING_KEY,
                    emailMessage
            );
            log.info("Email message sent to queue: {}", emailMessage.getTo());
        } catch (Exception e) {
            log.error("Failed to send email message to queue", e);
            throw new RuntimeException("Failed to send email message", e);
        }
    }

    public void sendNotificationMessage(NotificationMessage notificationMessage) {
        try {
            notificationMessage.setId(UUID.randomUUID().toString());
            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.LMS_EXCHANGE,
                    RabbitMQConfig.NOTIFICATION_ROUTING_KEY,
                    notificationMessage
            );
            log.info("Notification message sent to queue for user: {}", notificationMessage.getUserId());
        } catch (Exception e) {
            log.error("Failed to send notification message to queue", e);
            throw new RuntimeException("Failed to send notification message", e);
        }
    }

    public void sendCertificateMessage(CertificateMessage certificateMessage) {
        try {
            certificateMessage.setId(UUID.randomUUID().toString());
            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.LMS_EXCHANGE,
                    RabbitMQConfig.CERTIFICATE_ROUTING_KEY,
                    certificateMessage
            );
            log.info("Certificate generation message sent to queue for enrollment: {}", 
                    certificateMessage.getEnrollmentId());
        } catch (Exception e) {
            log.error("Failed to send certificate message to queue", e);
            throw new RuntimeException("Failed to send certificate message", e);
        }
    }
}
