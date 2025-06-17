package com.lms.controller;

import com.lms.dto.admin.InstructorApprovalRequest;
import com.lms.dto.user.UserDto;
import com.lms.entity.User;
import com.lms.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserService userService;

    @GetMapping("/users")
    public ResponseEntity<Page<UserDto>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) User.Role role) {
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<UserDto> users = userService.getAllUsers(search, role, pageable);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/instructors/pending")
    public ResponseEntity<List<UserDto>> getPendingInstructors() {
        List<UserDto> pendingInstructors = userService.getPendingInstructors();
        return ResponseEntity.ok(pendingInstructors);
    }

    @PostMapping("/instructors/approve")
    public ResponseEntity<UserDto> approveInstructor(@Valid @RequestBody InstructorApprovalRequest request) {
        UserDto approvedInstructor = userService.approveInstructor(request);
        return ResponseEntity.ok(approvedInstructor);
    }

    @PutMapping("/users/{userId}/toggle-status")
    public ResponseEntity<Map<String, String>> toggleUserStatus(@PathVariable String userId) {
        userService.toggleUserStatus(userId);
        return ResponseEntity.ok(Map.of("message", "User status updated successfully"));
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable String userId) {
        userService.deleteUser(userId);
        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }
}
