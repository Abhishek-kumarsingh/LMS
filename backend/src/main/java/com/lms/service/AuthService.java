package com.lms.service;

import com.lms.dto.auth.AuthResponse;
import com.lms.dto.auth.LoginRequest;
import com.lms.dto.auth.RefreshTokenRequest;
import com.lms.dto.auth.RegisterRequest;
import com.lms.dto.user.UserDto;
import com.lms.entity.RefreshToken;
import com.lms.entity.User;
import com.lms.exception.BadRequestException;
import com.lms.exception.ResourceNotFoundException;
import com.lms.exception.UserAlreadyExistsException;
import com.lms.mapper.UserMapper;
import com.lms.repository.UserRepository;
import com.lms.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final UserMapper userMapper;
    private final EmailService emailService;
    private final RefreshTokenService refreshTokenService;
    private final SecurityAuditService securityAuditService;

    @Transactional
    public AuthResponse login(LoginRequest loginRequest, HttpServletRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getEmail(),
                            loginRequest.getPassword()
                    )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);

            User user = userRepository.findByEmail(loginRequest.getEmail())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));

            // Check if user account is active
            if (!user.isActive()) {
                throw new BadRequestException("Account is disabled");
            }

            // Generate tokens
            String accessToken = jwtUtils.generateJwtToken(user.getEmail(), user.getId(), user.getRole().name());
            RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId(), request);

            // Calculate expiration info
            Date expirationDate = jwtUtils.getExpirationDateFromToken(accessToken);
            LocalDateTime expiresAt = expirationDate.toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime();
            long expiresIn = (expirationDate.getTime() - System.currentTimeMillis()) / 1000;

            UserDto userDto = userMapper.toDto(user);

            // Log successful authentication
            securityAuditService.logSuccessfulAuthentication(user.getEmail(), request);

            // Check for suspicious activity
            String clientIp = request != null ? getClientIpAddress(request) : "unknown";
            refreshTokenService.checkSuspiciousActivity(user.getId(), clientIp);

            return new AuthResponse(accessToken, refreshToken.getToken(), userDto, expiresAt, expiresIn);

        } catch (Exception e) {
            // Log failed authentication
            securityAuditService.logFailedAuthentication(loginRequest.getEmail(), e.getMessage(), request);
            throw e;
        }
    }

    @Transactional
    public AuthResponse register(RegisterRequest registerRequest) {
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new UserAlreadyExistsException("User already exists with email: " + registerRequest.getEmail());
        }

        // Create new user
        User user = new User();
        user.setId(UUID.randomUUID().toString());
        user.setFirstName(registerRequest.getFirstName());
        user.setLastName(registerRequest.getLastName());
        user.setEmail(registerRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setRole(registerRequest.getRole());
        
        // Students are auto-approved, instructors need approval
        if (registerRequest.getRole() == User.Role.STUDENT) {
            user.setApproved(true);
        }
        
        // Generate verification token
        user.setVerificationToken(UUID.randomUUID().toString());

        User savedUser = userRepository.save(user);

        // Send welcome email
        emailService.sendWelcomeEmail(savedUser);

        // If instructor, notify admin
        if (registerRequest.getRole() == User.Role.INSTRUCTOR) {
            emailService.sendInstructorApplicationNotification(savedUser);
        }

        // Generate JWT token
        String jwt = jwtUtils.generateTokenFromEmail(
                savedUser.getEmail(), 
                savedUser.getId(), 
                savedUser.getRole().name()
        );

        UserDto userDto = userMapper.toDto(savedUser);

        return new AuthResponse(jwt, userDto);
    }

    @Transactional
    public void verifyEmail(String token) {
        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> new BadRequestException("Invalid verification token"));

        user.setEmailVerified(true);
        user.setVerificationToken(null);
        userRepository.save(user);
    }

    @Transactional
    public void requestPasswordReset(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        String resetToken = UUID.randomUUID().toString();
        user.setResetPasswordToken(resetToken);
        user.setResetPasswordExpires(java.time.LocalDateTime.now().plusHours(1)); // 1 hour expiry

        userRepository.save(user);
        emailService.sendPasswordResetEmail(user, resetToken);
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        User user = userRepository.findByResetPasswordToken(token)
                .orElseThrow(() -> new BadRequestException("Invalid reset token"));

        if (user.getResetPasswordExpires().isBefore(java.time.LocalDateTime.now())) {
            throw new BadRequestException("Reset token has expired");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetPasswordToken(null);
        user.setResetPasswordExpires(null);

        userRepository.save(user);
    }

    /**
     * Refresh access token using refresh token
     */
    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request, HttpServletRequest httpRequest) {
        String requestRefreshToken = request.getRefreshToken();

        RefreshToken refreshToken = refreshTokenService.findByToken(requestRefreshToken);
        refreshToken = refreshTokenService.verifyExpiration(refreshToken);

        User user = refreshToken.getUser();

        // Generate new access token
        String newAccessToken = jwtUtils.generateJwtToken(user.getEmail(), user.getId(), user.getRole().name());

        // Calculate expiration info
        Date expirationDate = jwtUtils.getExpirationDateFromToken(newAccessToken);
        LocalDateTime expiresAt = expirationDate.toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime();
        long expiresIn = (expirationDate.getTime() - System.currentTimeMillis()) / 1000;

        UserDto userDto = userMapper.toDto(user);

        log.info("Refreshed access token for user: {}", user.getEmail());

        return new AuthResponse(newAccessToken, requestRefreshToken, userDto, expiresAt, expiresIn);
    }

    /**
     * Logout user and revoke refresh token
     */
    @Transactional
    public void logout(String refreshToken, HttpServletRequest request) {
        try {
            refreshTokenService.revokeToken(refreshToken);
            SecurityContextHolder.clearContext();

            log.info("User logged out successfully");
        } catch (Exception e) {
            log.warn("Error during logout: {}", e.getMessage());
        }
    }

    /**
     * Logout from all devices
     */
    @Transactional
    public void logoutFromAllDevices(String userId, HttpServletRequest request) {
        refreshTokenService.revokeAllUserTokens(userId);
        SecurityContextHolder.clearContext();

        securityAuditService.logAdminAction(userId, "LOGOUT_ALL_DEVICES", userId,
            Map.of("reason", "User requested logout from all devices"), request);

        log.info("User {} logged out from all devices", userId);
    }

    /**
     * Get active sessions for a user
     */
    public List<RefreshToken> getActiveSessions(String userId) {
        return refreshTokenService.getActiveTokensForUser(userId);
    }

    /**
     * Revoke a specific session
     */
    @Transactional
    public void revokeSession(String userId, String tokenId, HttpServletRequest request) {
        List<RefreshToken> userTokens = refreshTokenService.getActiveTokensForUser(userId);
        RefreshToken tokenToRevoke = userTokens.stream()
            .filter(token -> token.getId().equals(tokenId))
            .findFirst()
            .orElseThrow(() -> new BadRequestException("Session not found"));

        refreshTokenService.revokeToken(tokenToRevoke.getToken());

        securityAuditService.logAdminAction(userId, "REVOKE_SESSION", userId,
            Map.of("sessionId", tokenId), request);

        log.info("Revoked session {} for user {}", tokenId, userId);
    }

    /**
     * Extract client IP address from request
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty() && !"unknown".equalsIgnoreCase(xForwardedFor)) {
            return xForwardedFor.split(",")[0].trim();
        }

        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty() && !"unknown".equalsIgnoreCase(xRealIp)) {
            return xRealIp;
        }

        return request.getRemoteAddr();
    }
}
