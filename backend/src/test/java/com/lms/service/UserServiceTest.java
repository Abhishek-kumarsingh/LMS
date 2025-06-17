package com.lms.service;

import com.lms.config.TestConfig;
import com.lms.dto.auth.RegisterRequest;
import com.lms.dto.user.UserDto;
import com.lms.entity.User;
import com.lms.exception.ResourceNotFoundException;
import com.lms.exception.UserAlreadyExistsException;
import com.lms.mapper.UserMapper;
import com.lms.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("UserService Tests")
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserMapper userMapper;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private UserService userService;

    private User testUser;
    private UserDto testUserDto;
    private RegisterRequest registerRequest;

    @BeforeEach
    void setUp() {
        testUser = TestConfig.createTestStudent();
        testUserDto = new UserDto();
        testUserDto.setId(testUser.getId());
        testUserDto.setEmail(testUser.getEmail());
        testUserDto.setFirstName(testUser.getFirstName());
        testUserDto.setLastName(testUser.getLastName());
        testUserDto.setRole(testUser.getRole().name());

        registerRequest = new RegisterRequest();
        registerRequest.setEmail("new.user@example.com");
        registerRequest.setPassword("password123");
        registerRequest.setFirstName("New");
        registerRequest.setLastName("User");
        registerRequest.setRole("STUDENT");
    }

    @Test
    @DisplayName("Should find user by ID successfully")
    void shouldFindUserByIdSuccessfully() {
        // Given
        when(userRepository.findById(testUser.getId())).thenReturn(Optional.of(testUser));
        when(userMapper.toDto(testUser)).thenReturn(testUserDto);

        // When
        UserDto result = userService.findById(testUser.getId());

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(testUser.getId());
        assertThat(result.getEmail()).isEqualTo(testUser.getEmail());
        verify(userRepository).findById(testUser.getId());
        verify(userMapper).toDto(testUser);
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when user not found by ID")
    void shouldThrowExceptionWhenUserNotFoundById() {
        // Given
        String nonExistentId = "non-existent-id";
        when(userRepository.findById(nonExistentId)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> userService.findById(nonExistentId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("User not found with id: " + nonExistentId);
        
        verify(userRepository).findById(nonExistentId);
        verifyNoInteractions(userMapper);
    }

    @Test
    @DisplayName("Should find user by email successfully")
    void shouldFindUserByEmailSuccessfully() {
        // Given
        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));
        when(userMapper.toDto(testUser)).thenReturn(testUserDto);

        // When
        UserDto result = userService.findByEmail(testUser.getEmail());

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getEmail()).isEqualTo(testUser.getEmail());
        verify(userRepository).findByEmail(testUser.getEmail());
        verify(userMapper).toDto(testUser);
    }

    @Test
    @DisplayName("Should register new user successfully")
    void shouldRegisterNewUserSuccessfully() {
        // Given
        User newUser = new User();
        newUser.setEmail(registerRequest.getEmail());
        newUser.setFirstName(registerRequest.getFirstName());
        newUser.setLastName(registerRequest.getLastName());
        
        when(userRepository.existsByEmail(registerRequest.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(registerRequest.getPassword())).thenReturn("encoded-password");
        when(userMapper.toEntity(any(RegisterRequest.class))).thenReturn(newUser);
        when(userRepository.save(any(User.class))).thenReturn(newUser);
        when(userMapper.toDto(newUser)).thenReturn(testUserDto);

        // When
        UserDto result = userService.register(registerRequest);

        // Then
        assertThat(result).isNotNull();
        verify(userRepository).existsByEmail(registerRequest.getEmail());
        verify(passwordEncoder).encode(registerRequest.getPassword());
        verify(userRepository).save(any(User.class));
        verify(emailService).sendWelcomeEmail(any(User.class));
    }

    @Test
    @DisplayName("Should throw UserAlreadyExistsException when email already exists")
    void shouldThrowExceptionWhenEmailAlreadyExists() {
        // Given
        when(userRepository.existsByEmail(registerRequest.getEmail())).thenReturn(true);

        // When & Then
        assertThatThrownBy(() -> userService.register(registerRequest))
                .isInstanceOf(UserAlreadyExistsException.class)
                .hasMessageContaining("User already exists with email: " + registerRequest.getEmail());
        
        verify(userRepository).existsByEmail(registerRequest.getEmail());
        verifyNoMoreInteractions(userRepository, passwordEncoder, userMapper, emailService);
    }

    @Test
    @DisplayName("Should get all users with pagination")
    void shouldGetAllUsersWithPagination() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        List<User> users = Arrays.asList(testUser, TestConfig.createTestInstructor());
        Page<User> userPage = new PageImpl<>(users, pageable, users.size());
        
        when(userRepository.findAll(pageable)).thenReturn(userPage);
        when(userMapper.toDto(any(User.class))).thenReturn(testUserDto);

        // When
        Page<UserDto> result = userService.getAllUsers(pageable);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(2);
        assertThat(result.getTotalElements()).isEqualTo(2);
        verify(userRepository).findAll(pageable);
        verify(userMapper, times(2)).toDto(any(User.class));
    }

    @Test
    @DisplayName("Should update user successfully")
    void shouldUpdateUserSuccessfully() {
        // Given
        UserDto updateRequest = new UserDto();
        updateRequest.setFirstName("Updated");
        updateRequest.setLastName("Name");
        
        when(userRepository.findById(testUser.getId())).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(userMapper.toDto(any(User.class))).thenReturn(testUserDto);

        // When
        UserDto result = userService.updateUser(testUser.getId(), updateRequest);

        // Then
        assertThat(result).isNotNull();
        verify(userRepository).findById(testUser.getId());
        verify(userRepository).save(any(User.class));
        verify(userMapper).toDto(any(User.class));
    }

    @Test
    @DisplayName("Should delete user successfully")
    void shouldDeleteUserSuccessfully() {
        // Given
        when(userRepository.findById(testUser.getId())).thenReturn(Optional.of(testUser));

        // When
        userService.deleteUser(testUser.getId());

        // Then
        verify(userRepository).findById(testUser.getId());
        verify(userRepository).delete(testUser);
    }

    @Test
    @DisplayName("Should approve instructor successfully")
    void shouldApproveInstructorSuccessfully() {
        // Given
        User instructor = TestConfig.createTestInstructor();
        instructor.setApproved(false);
        
        when(userRepository.findById(instructor.getId())).thenReturn(Optional.of(instructor));
        when(userRepository.save(any(User.class))).thenReturn(instructor);

        // When
        userService.approveInstructor(instructor.getId());

        // Then
        verify(userRepository).findById(instructor.getId());
        verify(userRepository).save(argThat(user -> user.isApproved()));
        verify(emailService).sendInstructorApprovalEmail(any(User.class));
    }
}
