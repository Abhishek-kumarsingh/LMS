package com.lms.repository;

import com.lms.entity.RefreshToken;
import com.lms.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, String> {
    
    Optional<RefreshToken> findByToken(String token);
    
    List<RefreshToken> findByUserAndIsRevokedFalse(User user);
    
    List<RefreshToken> findByUserIdAndIsRevokedFalse(String userId);
    
    @Query("SELECT rt FROM RefreshToken rt WHERE rt.user.id = :userId AND rt.isRevoked = false ORDER BY rt.createdAt DESC")
    List<RefreshToken> findActiveTokensByUserId(@Param("userId") String userId);
    
    @Query("SELECT rt FROM RefreshToken rt WHERE rt.expiresAt < :now")
    List<RefreshToken> findExpiredTokens(@Param("now") LocalDateTime now);
    
    @Modifying
    @Query("UPDATE RefreshToken rt SET rt.isRevoked = true WHERE rt.user.id = :userId")
    void revokeAllUserTokens(@Param("userId") String userId);
    
    @Modifying
    @Query("UPDATE RefreshToken rt SET rt.isRevoked = true WHERE rt.user.id = :userId AND rt.id != :excludeTokenId")
    void revokeAllUserTokensExcept(@Param("userId") String userId, @Param("excludeTokenId") String excludeTokenId);
    
    @Modifying
    @Query("DELETE FROM RefreshToken rt WHERE rt.expiresAt < :now OR rt.isRevoked = true")
    void deleteExpiredAndRevokedTokens(@Param("now") LocalDateTime now);
    
    @Query("SELECT COUNT(rt) FROM RefreshToken rt WHERE rt.user.id = :userId AND rt.isRevoked = false")
    long countActiveTokensByUserId(@Param("userId") String userId);
    
    @Query("SELECT rt FROM RefreshToken rt WHERE rt.user.id = :userId AND rt.ipAddress = :ipAddress AND rt.isRevoked = false")
    List<RefreshToken> findActiveTokensByUserAndIp(@Param("userId") String userId, @Param("ipAddress") String ipAddress);
}
