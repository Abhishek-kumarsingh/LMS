package com.lms.repository;

import com.lms.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    
    Optional<User> findByEmail(String email);
    
    boolean existsByEmail(String email);
    
    Optional<User> findByVerificationToken(String token);
    
    Optional<User> findByResetPasswordToken(String token);
    
    List<User> findByRole(User.Role role);
    
    @Query("SELECT u FROM User u WHERE u.role = :role AND u.isApproved = :approved")
    Page<User> findByRoleAndIsApproved(@Param("role") User.Role role, 
                                       @Param("approved") boolean approved, 
                                       Pageable pageable);
    
    @Query("SELECT u FROM User u WHERE u.role = 'INSTRUCTOR' AND u.isApproved = false")
    List<User> findPendingInstructors();
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.role = :role")
    long countByRole(@Param("role") User.Role role);
    
    @Query("SELECT u FROM User u WHERE " +
           "(:search IS NULL OR LOWER(u.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:role IS NULL OR u.role = :role)")
    Page<User> findUsersWithFilters(@Param("search") String search,
                                   @Param("role") User.Role role,
                                   Pageable pageable);

    // Additional count methods for analytics
    long countByIsEnabledTrue();
    long countByIsEnabledFalse();
    long countByRoleAndIsApprovedFalse(User.Role role);
    long countByCreatedAtAfter(LocalDateTime date);

    // Find users by role and approval status
    List<User> findByRoleAndIsApprovedFalse(User.Role role);

    // Find active users
    List<User> findByIsEnabledTrue();

    // Find recent registrations
    List<User> findByCreatedAtAfterOrderByCreatedAtDesc(LocalDateTime date);

    // Get monthly registration statistics
    @Query("SELECT YEAR(u.createdAt), MONTH(u.createdAt), COUNT(u) FROM User u GROUP BY YEAR(u.createdAt), MONTH(u.createdAt) ORDER BY YEAR(u.createdAt) DESC, MONTH(u.createdAt) DESC")
    List<Object[]> getMonthlyRegistrations();
}
