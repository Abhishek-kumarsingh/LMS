package com.lms.repository;

import com.lms.config.TestConfig;
import com.lms.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
@DisplayName("UserRepository Tests")
class UserRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private UserRepository userRepository;

    private User testStudent;
    private User testInstructor;
    private User testAdmin;

    @BeforeEach
    void setUp() {
        testStudent = TestConfig.createTestStudent();
        testInstructor = TestConfig.createTestInstructor();
        testAdmin = TestConfig.createTestAdmin();

        entityManager.persistAndFlush(testStudent);
        entityManager.persistAndFlush(testInstructor);
        entityManager.persistAndFlush(testAdmin);
    }

    @Test
    @DisplayName("Should find user by email")
    void shouldFindUserByEmail() {
        // When
        Optional<User> found = userRepository.findByEmail(testStudent.getEmail());

        // Then
        assertThat(found).isPresent();
        assertThat(found.get().getEmail()).isEqualTo(testStudent.getEmail());
        assertThat(found.get().getFirstName()).isEqualTo(testStudent.getFirstName());
    }

    @Test
    @DisplayName("Should return empty when user not found by email")
    void shouldReturnEmptyWhenUserNotFoundByEmail() {
        // When
        Optional<User> found = userRepository.findByEmail("nonexistent@example.com");

        // Then
        assertThat(found).isEmpty();
    }

    @Test
    @DisplayName("Should check if user exists by email")
    void shouldCheckIfUserExistsByEmail() {
        // When & Then
        assertThat(userRepository.existsByEmail(testStudent.getEmail())).isTrue();
        assertThat(userRepository.existsByEmail("nonexistent@example.com")).isFalse();
    }

    @Test
    @DisplayName("Should find users by role")
    void shouldFindUsersByRole() {
        // When
        List<User> students = userRepository.findByRole(User.Role.STUDENT);
        List<User> instructors = userRepository.findByRole(User.Role.INSTRUCTOR);
        List<User> admins = userRepository.findByRole(User.Role.ADMIN);

        // Then
        assertThat(students).hasSize(1);
        assertThat(students.get(0).getRole()).isEqualTo(User.Role.STUDENT);
        
        assertThat(instructors).hasSize(1);
        assertThat(instructors.get(0).getRole()).isEqualTo(User.Role.INSTRUCTOR);
        
        assertThat(admins).hasSize(1);
        assertThat(admins.get(0).getRole()).isEqualTo(User.Role.ADMIN);
    }

    @Test
    @DisplayName("Should find users by role and approval status with pagination")
    void shouldFindUsersByRoleAndApprovalStatusWithPagination() {
        // Given
        PageRequest pageRequest = PageRequest.of(0, 10);

        // When
        Page<User> approvedInstructors = userRepository.findByRoleAndIsApproved(
                User.Role.INSTRUCTOR, true, pageRequest);
        Page<User> unapprovedInstructors = userRepository.findByRoleAndIsApproved(
                User.Role.INSTRUCTOR, false, pageRequest);

        // Then
        assertThat(approvedInstructors.getContent()).hasSize(1);
        assertThat(approvedInstructors.getContent().get(0).isApproved()).isTrue();
        
        assertThat(unapprovedInstructors.getContent()).isEmpty();
    }

    @Test
    @DisplayName("Should count users by role")
    void shouldCountUsersByRole() {
        // When & Then
        assertThat(userRepository.countByRole(User.Role.STUDENT)).isEqualTo(1);
        assertThat(userRepository.countByRole(User.Role.INSTRUCTOR)).isEqualTo(1);
        assertThat(userRepository.countByRole(User.Role.ADMIN)).isEqualTo(1);
    }

    @Test
    @DisplayName("Should count enabled and disabled users")
    void shouldCountEnabledAndDisabledUsers() {
        // When & Then
        assertThat(userRepository.countByIsEnabledTrue()).isEqualTo(3);
        assertThat(userRepository.countByIsEnabledFalse()).isEqualTo(0);
    }

    @Test
    @DisplayName("Should find users created after specific date")
    void shouldFindUsersCreatedAfterSpecificDate() {
        // Given
        LocalDateTime yesterday = LocalDateTime.now().minusDays(1);
        LocalDateTime tomorrow = LocalDateTime.now().plusDays(1);

        // When
        long countAfterYesterday = userRepository.countByCreatedAtAfter(yesterday);
        long countAfterTomorrow = userRepository.countByCreatedAtAfter(tomorrow);

        // Then
        assertThat(countAfterYesterday).isEqualTo(3);
        assertThat(countAfterTomorrow).isEqualTo(0);
    }

    @Test
    @DisplayName("Should find unapproved instructors")
    void shouldFindUnapprovedInstructors() {
        // Given
        User unapprovedInstructor = TestConfig.createTestInstructor();
        unapprovedInstructor.setEmail("unapproved@example.com");
        unapprovedInstructor.setApproved(false);
        entityManager.persistAndFlush(unapprovedInstructor);

        // When
        List<User> unapprovedInstructors = userRepository.findByRoleAndIsApprovedFalse(User.Role.INSTRUCTOR);

        // Then
        assertThat(unapprovedInstructors).hasSize(1);
        assertThat(unapprovedInstructors.get(0).isApproved()).isFalse();
        assertThat(unapprovedInstructors.get(0).getRole()).isEqualTo(User.Role.INSTRUCTOR);
    }

    @Test
    @DisplayName("Should find active users")
    void shouldFindActiveUsers() {
        // Given
        User disabledUser = TestConfig.createTestStudent();
        disabledUser.setEmail("disabled@example.com");
        disabledUser.setEnabled(false);
        entityManager.persistAndFlush(disabledUser);

        // When
        List<User> activeUsers = userRepository.findByIsEnabledTrue();

        // Then
        assertThat(activeUsers).hasSize(3); // Original 3 users are enabled
        assertThat(activeUsers).allMatch(User::isEnabled);
    }

    @Test
    @DisplayName("Should find recent registrations")
    void shouldFindRecentRegistrations() {
        // Given
        LocalDateTime yesterday = LocalDateTime.now().minusDays(1);

        // When
        List<User> recentUsers = userRepository.findByCreatedAtAfterOrderByCreatedAtDesc(yesterday);

        // Then
        assertThat(recentUsers).hasSize(3);
        // Verify ordering (most recent first)
        for (int i = 0; i < recentUsers.size() - 1; i++) {
            assertThat(recentUsers.get(i).getCreatedAt())
                    .isAfterOrEqualTo(recentUsers.get(i + 1).getCreatedAt());
        }
    }

    @Test
    @DisplayName("Should get monthly registration statistics")
    void shouldGetMonthlyRegistrationStatistics() {
        // When
        List<Object[]> monthlyStats = userRepository.getMonthlyRegistrations();

        // Then
        assertThat(monthlyStats).isNotEmpty();
        // Each result should have year, month, and count
        for (Object[] stat : monthlyStats) {
            assertThat(stat).hasSize(3);
            assertThat(stat[0]).isInstanceOf(Integer.class); // year
            assertThat(stat[1]).isInstanceOf(Integer.class); // month
            assertThat(stat[2]).isInstanceOf(Long.class);    // count
        }
    }

    @Test
    @DisplayName("Should find user by verification token")
    void shouldFindUserByVerificationToken() {
        // Given
        String verificationToken = "test-verification-token";
        testStudent.setVerificationToken(verificationToken);
        entityManager.persistAndFlush(testStudent);

        // When
        Optional<User> found = userRepository.findByVerificationToken(verificationToken);

        // Then
        assertThat(found).isPresent();
        assertThat(found.get().getVerificationToken()).isEqualTo(verificationToken);
    }

    @Test
    @DisplayName("Should find user by reset password token")
    void shouldFindUserByResetPasswordToken() {
        // Given
        String resetToken = "test-reset-token";
        testStudent.setResetPasswordToken(resetToken);
        entityManager.persistAndFlush(testStudent);

        // When
        Optional<User> found = userRepository.findByResetPasswordToken(resetToken);

        // Then
        assertThat(found).isPresent();
        assertThat(found.get().getResetPasswordToken()).isEqualTo(resetToken);
    }
}
