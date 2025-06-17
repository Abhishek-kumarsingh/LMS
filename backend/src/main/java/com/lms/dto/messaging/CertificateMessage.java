package com.lms.dto.messaging;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CertificateMessage {
    
    private String id;
    private String enrollmentId;
    private String userId;
    private String courseId;
    private String userName;
    private String courseName;
    private String instructorName;
    private LocalDateTime completionDate;
    private LocalDateTime createdAt;
    private int retryCount;
    
    public CertificateMessage(String enrollmentId, String userId, String courseId, 
                            String userName, String courseName, String instructorName, 
                            LocalDateTime completionDate) {
        this.enrollmentId = enrollmentId;
        this.userId = userId;
        this.courseId = courseId;
        this.userName = userName;
        this.courseName = courseName;
        this.instructorName = instructorName;
        this.completionDate = completionDate;
        this.createdAt = LocalDateTime.now();
        this.retryCount = 0;
    }
}
