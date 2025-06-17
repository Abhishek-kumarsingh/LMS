package com.lms.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SystemHealthDto {
    
    private LocalDateTime timestamp;
    private String overallStatus;
    private List<ServiceHealth> services;
    private SystemMetrics metrics;
    private List<Alert> alerts;
    private MaintenanceInfo maintenance;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ServiceHealth {
        private String serviceName;
        private String status;
        private String description;
        private LocalDateTime lastChecked;
        private long responseTime;
        private Map<String, Object> details;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SystemMetrics {
        private DatabaseMetrics database;
        private QueueMetrics messageQueues;
        private StorageMetrics storage;
        private PerformanceMetrics performance;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DatabaseMetrics {
        private String status;
        private long connectionCount;
        private long activeConnections;
        private double cpuUsage;
        private double memoryUsage;
        private long queryCount;
        private double averageQueryTime;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QueueMetrics {
        private String status;
        private long emailQueueSize;
        private long notificationQueueSize;
        private long certificateQueueSize;
        private long processedMessages;
        private long failedMessages;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StorageMetrics {
        private String status;
        private long totalSpace;
        private long usedSpace;
        private long freeSpace;
        private double usagePercentage;
        private long fileCount;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PerformanceMetrics {
        private double cpuUsage;
        private double memoryUsage;
        private long activeThreads;
        private double averageResponseTime;
        private long requestCount;
        private long errorCount;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Alert {
        private String id;
        private String level;
        private String title;
        private String message;
        private LocalDateTime createdAt;
        private boolean acknowledged;
        private String source;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MaintenanceInfo {
        private boolean scheduledMaintenance;
        private LocalDateTime nextMaintenanceWindow;
        private String maintenanceDescription;
        private long estimatedDuration;
    }
}
