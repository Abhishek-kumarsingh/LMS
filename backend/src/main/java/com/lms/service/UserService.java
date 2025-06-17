package com.lms.service;

import com.lms.dto.admin.InstructorApprovalRequest;
import com.lms.dto.user.ChangePasswordRequest;
import com.lms.dto.user.UpdateProfileRequest;
import com.lms.dto.user.UserDto;
import com.lms.dto.user.UserProfileDto;
import com.lms.entity.User;
import com.lms.exception.BadRequestException;
import com.lms.exception.ResourceNotFoundException;
import com.lms.mapper.UserMapper;
import com.lms.repository.UserRepository;
import com.lms.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final CloudinaryService cloudinaryService;
    private final EmailService emailService;

    public UserProfileDto getCurrentUserProfile() {
        User user = getCurrentUser();
        return mapToProfileDto(user);
    }

    public UserProfileDto getUserProfile(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return mapToProfileDto(user);
    }

    @Transactional
    public UserProfileDto updateProfile(UpdateProfileRequest request) {
        User user = getCurrentUser();
        
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setBio(request.getBio());
        user.setWebsite(request.getWebsite());
        user.setLinkedin(request.getLinkedin());
        user.setTwitter(request.getTwitter());
        user.setGithub(request.getGithub());
        
        User savedUser = userRepository.save(user);
        return mapToProfileDto(savedUser);
    }

    @Transactional
    public UserProfileDto uploadAvatar(MultipartFile file) throws IOException {
        User user = getCurrentUser();
        
        // Validate file
        if (file.isEmpty()) {
            throw new BadRequestException("Please select a file to upload");
        }
        
        if (!isImageFile(file)) {
            throw new BadRequestException("Only image files are allowed");
        }
        
        if (file.getSize() > 5 * 1024 * 1024) { // 5MB limit
            throw new BadRequestException("File size must be less than 5MB");
        }
        
        // Delete old avatar if exists
        if (user.getAvatarUrl() != null) {
            String publicId = cloudinaryService.extractPublicIdFromUrl(user.getAvatarUrl());
            if (publicId != null) {
                cloudinaryService.deleteFile(publicId);
            }
        }
        
        // Upload new avatar
        String avatarUrl = cloudinaryService.uploadImage(file, "avatars");
        user.setAvatarUrl(avatarUrl);
        
        User savedUser = userRepository.save(user);
        return mapToProfileDto(savedUser);
    }

    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        User user = getCurrentUser();
        
        // Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }
        
        // Verify new password confirmation
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("New password and confirmation do not match");
        }
        
        // Update password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        
        log.info("Password changed for user: {}", user.getEmail());
    }

    // Admin methods
    public Page<UserDto> getAllUsers(String search, User.Role role, Pageable pageable) {
        Page<User> users = userRepository.findUsersWithFilters(search, role, pageable);
        return users.map(userMapper::toDto);
    }

    public List<UserDto> getPendingInstructors() {
        List<User> pendingInstructors = userRepository.findPendingInstructors();
        return pendingInstructors.stream()
                .map(userMapper::toDto)
                .toList();
    }

    @Transactional
    public UserDto approveInstructor(InstructorApprovalRequest request) {
        User instructor = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Instructor not found"));
        
        if (instructor.getRole() != User.Role.INSTRUCTOR) {
            throw new BadRequestException("User is not an instructor");
        }
        
        instructor.setApproved(request.getApproved());
        User savedInstructor = userRepository.save(instructor);
        
        // Send notification email
        if (request.getApproved()) {
            emailService.sendInstructorApprovedEmail(instructor);
        } else {
            emailService.sendInstructorRejectedEmail(instructor, request.getReason());
        }
        
        log.info("Instructor {} {}", instructor.getEmail(), 
                request.getApproved() ? "approved" : "rejected");
        
        return userMapper.toDto(savedInstructor);
    }

    @Transactional
    public void toggleUserStatus(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        user.setEnabled(!user.isEnabled());
        userRepository.save(user);
        
        log.info("User {} status changed to: {}", user.getEmail(), 
                user.isEnabled() ? "enabled" : "disabled");
    }

    @Transactional
    public void deleteUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        // Delete avatar from Cloudinary if exists
        if (user.getAvatarUrl() != null) {
            String publicId = cloudinaryService.extractPublicIdFromUrl(user.getAvatarUrl());
            if (publicId != null) {
                cloudinaryService.deleteFile(publicId);
            }
        }
        
        userRepository.delete(user);
        log.info("User deleted: {}", user.getEmail());
    }

    // Helper methods
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        
        return userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Current user not found"));
    }

    private boolean isImageFile(MultipartFile file) {
        String contentType = file.getContentType();
        return contentType != null && contentType.startsWith("image/");
    }

    private UserProfileDto mapToProfileDto(User user) {
        UserProfileDto dto = new UserProfileDto();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setFullName(user.getFullName());
        dto.setRole(user.getRole());
        dto.setAvatarUrl(user.getAvatarUrl());
        dto.setApproved(user.isApproved());
        dto.setEnabled(user.isEnabled());
        dto.setEmailVerified(user.isEmailVerified());
        dto.setBio(user.getBio());
        dto.setWebsite(user.getWebsite());
        dto.setLinkedin(user.getLinkedin());
        dto.setTwitter(user.getTwitter());
        dto.setGithub(user.getGithub());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());
        
        // TODO: Add statistics calculation when course entities are implemented
        
        return dto;
    }
}
