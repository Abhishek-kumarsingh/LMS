package com.lms.service;

import com.lms.entity.*;
import com.lms.exception.BadRequestException;
import com.lms.exception.ResourceNotFoundException;
import com.lms.repository.*;
import com.lms.service.messaging.MessagingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AssignmentSubmissionService {

    private final AssignmentSubmissionRepository submissionRepository;
    private final AssignmentRepository assignmentRepository;
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final MessagingService messagingService;

    @Transactional
    public AssignmentSubmission submitAssignment(String assignmentId, AssignmentSubmission submission) {
        User currentUser = getCurrentUser();
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));

        // Validate submission eligibility
        validateSubmissionEligibility(assignment, currentUser);

        // Check if student is enrolled in the course
        if (!enrollmentRepository.existsByUserAndCourse(currentUser, assignment.getCourse())) {
            throw new BadRequestException("You must be enrolled in the course to submit assignments");
        }

        // Check attempt limits
        int currentAttempts = submissionRepository.countByAssignmentAndStudent(assignment, currentUser);
        if (assignment.getMaxAttempts() != null && currentAttempts >= assignment.getMaxAttempts()) {
            throw new BadRequestException("Maximum number of attempts exceeded");
        }

        // Set submission properties
        submission.setId(UUID.randomUUID().toString());
        submission.setAssignment(assignment);
        submission.setStudent(currentUser);
        submission.setSubmittedAt(LocalDateTime.now());
        submission.setAttemptNumber(currentAttempts + 1);
        submission.setStatus(AssignmentSubmission.SubmissionStatus.SUBMITTED);

        // Check if submission is late
        if (assignment.getDueDate() != null && submission.getSubmittedAt().isAfter(assignment.getDueDate())) {
            if (!assignment.isAllowLateSubmission()) {
                throw new BadRequestException("Late submissions are not allowed for this assignment");
            }
            submission.setLate(true);
        }

        // Validate submission content
        validateSubmissionContent(assignment, submission);

        AssignmentSubmission savedSubmission = submissionRepository.save(submission);
        
        log.info("Assignment submission created: {} for assignment: {} by student: {}", 
                savedSubmission.getId(), assignment.getTitle(), currentUser.getEmail());

        // Send notification to instructor
        try {
            messagingService.sendAssignmentSubmissionNotification(savedSubmission);
        } catch (Exception e) {
            log.error("Failed to send assignment submission notification", e);
        }

        return savedSubmission;
    }

    @Transactional
    @CacheEvict(value = "submissions", allEntries = true)
    public AssignmentSubmission updateSubmission(String submissionId, AssignmentSubmission submissionUpdate) {
        AssignmentSubmission existingSubmission = getSubmissionById(submissionId);
        User currentUser = getCurrentUser();

        // Check permissions
        if (!currentUser.getId().equals(existingSubmission.getStudent().getId()) && !currentUser.isAdmin()) {
            throw new BadRequestException("You can only update your own submissions");
        }

        // Check if submission can be updated
        if (existingSubmission.getStatus() == AssignmentSubmission.SubmissionStatus.GRADED) {
            throw new BadRequestException("Cannot update graded submissions");
        }

        // Update submission content
        existingSubmission.setSubmissionText(submissionUpdate.getSubmissionText());
        existingSubmission.setSubmissionFiles(submissionUpdate.getSubmissionFiles());
        existingSubmission.setSubmissionMetadata(submissionUpdate.getSubmissionMetadata());
        existingSubmission.setStatus(AssignmentSubmission.SubmissionStatus.RESUBMITTED);

        // Validate submission content
        validateSubmissionContent(existingSubmission.getAssignment(), existingSubmission);

        AssignmentSubmission savedSubmission = submissionRepository.save(existingSubmission);
        
        log.info("Assignment submission updated: {}", savedSubmission.getId());

        return savedSubmission;
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "submissions", key = "#submissionId")
    public AssignmentSubmission getSubmissionById(String submissionId) {
        return submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found"));
    }

    @Transactional(readOnly = true)
    public Optional<AssignmentSubmission> getStudentSubmission(String assignmentId, String studentId) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));
        
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        return submissionRepository.findByAssignmentAndStudent(assignment, student);
    }

    @Transactional(readOnly = true)
    public Optional<AssignmentSubmission> getCurrentUserSubmission(String assignmentId) {
        User currentUser = getCurrentUser();
        return getStudentSubmission(assignmentId, currentUser.getId());
    }

    @Transactional(readOnly = true)
    public Page<AssignmentSubmission> getSubmissionsByAssignment(String assignmentId, Pageable pageable) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));
        
        User currentUser = getCurrentUser();
        
        // Check permissions
        if (!currentUser.isAdmin() && !assignment.getCreatedBy().getId().equals(currentUser.getId())) {
            throw new BadRequestException("You can only view submissions for your own assignments");
        }

        return submissionRepository.findByAssignment(assignment, pageable);
    }

    @Transactional(readOnly = true)
    public Page<AssignmentSubmission> getStudentSubmissions(String studentId, Pageable pageable) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        
        User currentUser = getCurrentUser();
        
        // Check permissions
        if (!currentUser.isAdmin() && !currentUser.getId().equals(studentId)) {
            throw new BadRequestException("You can only view your own submissions");
        }

        return submissionRepository.findByStudent(student, pageable);
    }

    @Transactional(readOnly = true)
    public List<AssignmentSubmission> getSubmissionsRequiringGrading(String assignmentId) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));
        
        User currentUser = getCurrentUser();
        
        // Check permissions
        if (!currentUser.isAdmin() && !assignment.getCreatedBy().getId().equals(currentUser.getId())) {
            throw new BadRequestException("You can only view grading requirements for your own assignments");
        }

        return submissionRepository.findSubmissionsRequiringGrading(assignment);
    }

    @Transactional(readOnly = true)
    public List<AssignmentSubmission> getLateSubmissions(String assignmentId) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));
        
        User currentUser = getCurrentUser();
        
        // Check permissions
        if (!currentUser.isAdmin() && !assignment.getCreatedBy().getId().equals(currentUser.getId())) {
            throw new BadRequestException("You can only view late submissions for your own assignments");
        }

        return submissionRepository.findByAssignmentAndIsLateTrue(assignment);
    }

    @Transactional(readOnly = true)
    public Page<AssignmentSubmission> getSubmissionsByStatus(String assignmentId, 
                                                           AssignmentSubmission.SubmissionStatus status, 
                                                           Pageable pageable) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));
        
        User currentUser = getCurrentUser();
        
        // Check permissions
        if (!currentUser.isAdmin() && !assignment.getCreatedBy().getId().equals(currentUser.getId())) {
            throw new BadRequestException("You can only view submissions for your own assignments");
        }

        return submissionRepository.findByAssignmentAndStatus(assignment, status, pageable);
    }

    @Transactional
    @CacheEvict(value = "submissions", key = "#submissionId")
    public void deleteSubmission(String submissionId) {
        AssignmentSubmission submission = getSubmissionById(submissionId);
        User currentUser = getCurrentUser();

        // Check permissions
        if (!currentUser.getId().equals(submission.getStudent().getId()) && !currentUser.isAdmin()) {
            throw new BadRequestException("You can only delete your own submissions");
        }

        // Check if submission can be deleted
        if (submission.getStatus() == AssignmentSubmission.SubmissionStatus.GRADED) {
            throw new BadRequestException("Cannot delete graded submissions");
        }

        submissionRepository.delete(submission);
        
        log.info("Assignment submission deleted: {}", submission.getId());
    }

    @Transactional(readOnly = true)
    public boolean hasStudentSubmitted(String assignmentId, String studentId) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));
        
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        return submissionRepository.existsByAssignmentAndStudent(assignment, student);
    }

    @Transactional(readOnly = true)
    public int getSubmissionCount(String assignmentId, String studentId) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));
        
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        return submissionRepository.countByAssignmentAndStudent(assignment, student);
    }

    private void validateSubmissionEligibility(Assignment assignment, User student) {
        LocalDateTime now = LocalDateTime.now();

        // Check if assignment is published
        if (!assignment.isPublished()) {
            throw new BadRequestException("Assignment is not published yet");
        }

        // Check availability window
        if (assignment.getAvailableFrom() != null && now.isBefore(assignment.getAvailableFrom())) {
            throw new BadRequestException("Assignment is not available yet");
        }

        if (assignment.getAvailableUntil() != null && now.isAfter(assignment.getAvailableUntil())) {
            throw new BadRequestException("Assignment submission period has ended");
        }

        // Check due date for late submissions
        if (assignment.getDueDate() != null && now.isAfter(assignment.getDueDate()) && !assignment.isAllowLateSubmission()) {
            throw new BadRequestException("Assignment due date has passed and late submissions are not allowed");
        }
    }

    private void validateSubmissionContent(Assignment assignment, AssignmentSubmission submission) {
        // Validate based on submission format
        switch (assignment.getSubmissionFormat()) {
            case TEXT:
                if (submission.getSubmissionText() == null || submission.getSubmissionText().trim().isEmpty()) {
                    throw new BadRequestException("Text submission is required");
                }
                break;
            case FILE:
                if (submission.getSubmissionFiles() == null || submission.getSubmissionFiles().trim().isEmpty()) {
                    throw new BadRequestException("File submission is required");
                }
                break;
            case URL:
                if (submission.getSubmissionText() == null || !isValidUrl(submission.getSubmissionText())) {
                    throw new BadRequestException("Valid URL submission is required");
                }
                break;
        }
    }

    private boolean isValidUrl(String url) {
        try {
            new java.net.URL(url);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
