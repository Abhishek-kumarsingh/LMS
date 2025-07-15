package com.lms.service;

import com.lms.entity.RefreshToken;
import com.lms.entity.User;
import com.lms.exception.BadRequestException;
import com.lms.exception.ResourceNotFoundException;
import com.lms.repository.RefreshTokenRepository;
import com.lms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;
    private final SecurityAuditService securityAuditService;

    @Value("${jwt.refresh.expiration:604800000}") // 7 days in milliseconds
    private long refreshTokenExpirationMs;

    @Value("${jwt.refresh.max-tokens-per-user:5}")
    private int maxTokensPerUser;

    /**
     * Create a new refresh token for a user
     */
    @Transactional
    public RefreshToken createRefreshToken(String userId, HttpServletRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Check if user has too many active tokens
        long activeTokenCount = refreshTokenRepository.countActiveTokensByUserId(userId);
        if (activeTokenCount >= maxTokensPerUser) {
            // Revoke oldest tokens to make room
            List<RefreshToken> activeTokens = refreshTokenRepository.findActiveTokensByUserId(userId);
            int tokensToRevoke = (int) (activeTokenCount - maxTokensPerUser + 1);
            for (int i = 0; i < tokensToRevoke && i < activeTokens.size(); i++) {
                activeTokens.get(i).revoke();
                refreshTokenRepository.save(activeTokens.get(i));
            }
        }

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setId(UUID.randomUUID().toString());
        refreshToken.setToken(UUID.randomUUID().toString());
        refreshToken.setUser(user);
        refreshToken.setExpiresAt(LocalDateTime.now().plusSeconds(refreshTokenExpirationMs / 1000));
        
        if (request != null) {
            refreshToken.setIpAddress(getClientIpAddress(request));
            refreshToken.setDeviceInfo(getDeviceInfo(request));
        }

        RefreshToken savedToken = refreshTokenRepository.save(refreshToken);
        
        log.info("Created refresh token for user: {}", userId);
        return savedToken;
    }

    /**
     * Find refresh token by token string
     */
    public RefreshToken findByToken(String token) {
        return refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new BadRequestException("Invalid refresh token"));
    }

    /**
     * Verify refresh token and return if valid
     */
    public RefreshToken verifyExpiration(RefreshToken token) {
        if (token.isExpired()) {
            refreshTokenRepository.delete(token);
            throw new BadRequestException("Refresh token has expired. Please login again.");
        }

        if (token.isRevoked()) {
            throw new BadRequestException("Refresh token has been revoked. Please login again.");
        }

        // Update last used timestamp
        token.markAsUsed();
        refreshTokenRepository.save(token);

        return token;
    }

    /**
     * Revoke a specific refresh token
     */
    @Transactional
    public void revokeToken(String token) {
        RefreshToken refreshToken = findByToken(token);
        refreshToken.revoke();
        refreshTokenRepository.save(refreshToken);
        
        log.info("Revoked refresh token for user: {}", refreshToken.getUser().getId());
    }

    /**
     * Revoke all refresh tokens for a user
     */
    @Transactional
    public void revokeAllUserTokens(String userId) {
        refreshTokenRepository.revokeAllUserTokens(userId);
        log.info("Revoked all refresh tokens for user: {}", userId);
    }

    /**
     * Revoke all refresh tokens for a user except the current one
     */
    @Transactional
    public void revokeAllUserTokensExcept(String userId, String currentTokenId) {
        refreshTokenRepository.revokeAllUserTokensExcept(userId, currentTokenId);
        log.info("Revoked all refresh tokens for user: {} except: {}", userId, currentTokenId);
    }

    /**
     * Get all active refresh tokens for a user
     */
    public List<RefreshToken> getActiveTokensForUser(String userId) {
        return refreshTokenRepository.findActiveTokensByUserId(userId);
    }

    /**
     * Clean up expired and revoked tokens (scheduled task)
     */
    @Scheduled(fixedRate = 3600000) // Run every hour
    @Transactional
    public void cleanupExpiredTokens() {
        LocalDateTime now = LocalDateTime.now();
        List<RefreshToken> expiredTokens = refreshTokenRepository.findExpiredTokens(now);
        
        if (!expiredTokens.isEmpty()) {
            refreshTokenRepository.deleteExpiredAndRevokedTokens(now);
            log.info("Cleaned up {} expired/revoked refresh tokens", expiredTokens.size());
        }
    }

    /**
     * Check for suspicious activity (multiple tokens from different IPs)
     */
    public void checkSuspiciousActivity(String userId, String currentIp) {
        List<RefreshToken> activeTokens = refreshTokenRepository.findActiveTokensByUserId(userId);
        
        // Count unique IP addresses
        long uniqueIps = activeTokens.stream()
                .map(RefreshToken::getIpAddress)
                .filter(ip -> ip != null && !ip.equals(currentIp))
                .distinct()
                .count();

        if (uniqueIps > 3) { // More than 3 different IPs
            log.warn("Suspicious activity detected for user {}: {} different IP addresses", userId, uniqueIps + 1);
            securityAuditService.logSuspiciousActivity(
                "Multiple active sessions from different IP addresses", 
                userId, 
                null
            );
        }
    }

    /**
     * Get device information from request
     */
    private String getDeviceInfo(HttpServletRequest request) {
        String userAgent = request.getHeader("User-Agent");
        if (userAgent == null) {
            return "Unknown Device";
        }
        
        // Truncate to prevent excessively long device info
        return userAgent.length() > 255 ? userAgent.substring(0, 255) : userAgent;
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

    /**
     * Get refresh token statistics for admin
     */
    public RefreshTokenStats getTokenStats() {
        long totalTokens = refreshTokenRepository.count();
        long expiredTokens = refreshTokenRepository.findExpiredTokens(LocalDateTime.now()).size();
        long activeTokens = totalTokens - expiredTokens;
        
        return new RefreshTokenStats(totalTokens, activeTokens, expiredTokens);
    }

    /**
     * Refresh token statistics
     */
    public static class RefreshTokenStats {
        private final long totalTokens;
        private final long activeTokens;
        private final long expiredTokens;

        public RefreshTokenStats(long totalTokens, long activeTokens, long expiredTokens) {
            this.totalTokens = totalTokens;
            this.activeTokens = activeTokens;
            this.expiredTokens = expiredTokens;
        }

        public long getTotalTokens() { return totalTokens; }
        public long getActiveTokens() { return activeTokens; }
        public long getExpiredTokens() { return expiredTokens; }
    }
}
