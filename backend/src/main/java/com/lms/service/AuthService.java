package com.lms.service;

import com.lms.dto.auth.AuthResponse;
import com.lms.dto.auth.LoginRequest;
import com.lms.dto.auth.RegisterRequest;
import com.lms.dto.user.UserDto;
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

    @Transactional
    public AuthResponse login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        UserDto userDto = userMapper.toDto(user);

        return new AuthResponse(jwt, userDto);
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
}
