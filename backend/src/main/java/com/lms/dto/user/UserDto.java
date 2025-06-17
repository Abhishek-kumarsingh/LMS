package com.lms.dto.user;

import com.lms.entity.User;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserDto {
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
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
