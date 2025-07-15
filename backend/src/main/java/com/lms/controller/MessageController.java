package com.lms.controller;

import com.lms.entity.InAppMessage;
import com.lms.service.InAppMessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
@Slf4j
public class MessageController {

    private final InAppMessageService messageService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<InAppMessage>> getMessages(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "false") boolean unreadOnly) {
        
        String userId = getCurrentUserId();
        Pageable pageable = PageRequest.of(page, size);
        
        Page<InAppMessage> messages;
        if (unreadOnly) {
            messages = messageService.getUnreadMessagesForUser(userId, pageable);
        } else {
            messages = messageService.getMessagesForUser(userId, pageable);
        }
        
        return ResponseEntity.ok(messages);
    }

    @GetMapping("/unread")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<InAppMessage>> getUnreadMessages(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        String userId = getCurrentUserId();
        Pageable pageable = PageRequest.of(page, size);
        
        Page<InAppMessage> messages = messageService.getUnreadMessagesForUser(userId, pageable);
        return ResponseEntity.ok(messages);
    }

    @GetMapping("/count/unread")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Long>> getUnreadCount() {
        String userId = getCurrentUserId();
        long count = messageService.getUnreadMessageCount(userId);
        
        Map<String, Long> response = new HashMap<>();
        response.put("unreadCount", count);
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/high-priority")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<InAppMessage>> getHighPriorityMessages() {
        String userId = getCurrentUserId();
        List<InAppMessage> messages = messageService.getHighPriorityUnreadMessages(userId);
        
        return ResponseEntity.ok(messages);
    }

    @GetMapping("/statistics")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<InAppMessageService.MessageStatistics> getMessageStatistics() {
        String userId = getCurrentUserId();
        InAppMessageService.MessageStatistics stats = messageService.getMessageStatistics(userId);
        
        return ResponseEntity.ok(stats);
    }

    @PostMapping("/{messageId}/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> markMessageAsRead(@PathVariable String messageId) {
        String userId = getCurrentUserId();
        messageService.markMessageAsRead(messageId, userId);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Message marked as read");
        response.put("messageId", messageId);
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/read-all")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> markAllMessagesAsRead() {
        String userId = getCurrentUserId();
        messageService.markAllMessagesAsRead(userId);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "All messages marked as read");
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/send")
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    public ResponseEntity<InAppMessage> sendMessage(@RequestBody SendMessageRequest request) {
        String senderId = getCurrentUserId();
        
        InAppMessage message = messageService.sendMessage(
            request.getRecipientId(),
            request.getSubject(),
            request.getContent(),
            request.getType(),
            request.getPriority(),
            senderId,
            request.getActionUrl(),
            request.getActionText(),
            request.getMetadata()
        );
        
        return ResponseEntity.ok(message);
    }

    @PostMapping("/broadcast")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> sendSystemAnnouncement(@RequestBody BroadcastMessageRequest request) {
        messageService.sendSystemAnnouncement(
            request.getSubject(),
            request.getContent(),
            request.getPriority(),
            request.getActionUrl(),
            request.getActionText()
        );
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "System announcement sent to all users");
        
        return ResponseEntity.ok(response);
    }

    private String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getName(); // This should be the user ID
    }

    // Request DTOs
    public static class SendMessageRequest {
        private String recipientId;
        private String subject;
        private String content;
        private InAppMessage.MessageType type;
        private InAppMessage.Priority priority;
        private String actionUrl;
        private String actionText;
        private Map<String, String> metadata;

        // Getters and setters
        public String getRecipientId() { return recipientId; }
        public void setRecipientId(String recipientId) { this.recipientId = recipientId; }
        public String getSubject() { return subject; }
        public void setSubject(String subject) { this.subject = subject; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        public InAppMessage.MessageType getType() { return type; }
        public void setType(InAppMessage.MessageType type) { this.type = type; }
        public InAppMessage.Priority getPriority() { return priority; }
        public void setPriority(InAppMessage.Priority priority) { this.priority = priority; }
        public String getActionUrl() { return actionUrl; }
        public void setActionUrl(String actionUrl) { this.actionUrl = actionUrl; }
        public String getActionText() { return actionText; }
        public void setActionText(String actionText) { this.actionText = actionText; }
        public Map<String, String> getMetadata() { return metadata; }
        public void setMetadata(Map<String, String> metadata) { this.metadata = metadata; }
    }

    public static class BroadcastMessageRequest {
        private String subject;
        private String content;
        private InAppMessage.Priority priority;
        private String actionUrl;
        private String actionText;

        // Getters and setters
        public String getSubject() { return subject; }
        public void setSubject(String subject) { this.subject = subject; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        public InAppMessage.Priority getPriority() { return priority; }
        public void setPriority(InAppMessage.Priority priority) { this.priority = priority; }
        public String getActionUrl() { return actionUrl; }
        public void setActionUrl(String actionUrl) { this.actionUrl = actionUrl; }
        public String getActionText() { return actionText; }
        public void setActionText(String actionText) { this.actionText = actionText; }
    }
}
