package com.lms.dto.auth;

import com.lms.dto.user.UserDto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private String type = "Bearer";
    private UserDto user;
    private LocalDateTime expiresAt;
    private long expiresIn; // seconds until expiration

    public AuthResponse(String accessToken, UserDto user) {
        this.accessToken = accessToken;
        this.user = user;
    }

    public AuthResponse(String accessToken, String refreshToken, UserDto user, LocalDateTime expiresAt, long expiresIn) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.user = user;
        this.expiresAt = expiresAt;
        this.expiresIn = expiresIn;
    }
}
