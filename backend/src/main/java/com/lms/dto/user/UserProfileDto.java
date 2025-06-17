package com.lms.dto.user;

import com.lms.entity.User;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserProfileDto {
    private String id;
    private String email;
    private String firstName;
    private String lastName;
    private String fullName;
    private User.Role role;
    private String avatarUrl;
    private boolean isApproved;
    private boolean isEnabled;
    private boolean emailVerified;
    private String bio;
    private String website;
    private String linkedin;
    private String twitter;
    private String github;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Statistics for instructors
    private Long totalCourses;
    private Long totalStudents;
    private Double averageRating;
    private Long totalReviews;
    
    // Statistics for students
    private Long enrolledCourses;
    private Long completedCourses;
    private Long certificatesEarned;
}
