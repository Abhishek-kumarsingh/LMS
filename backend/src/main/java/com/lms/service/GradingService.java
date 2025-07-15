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

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class GradingService {

    private final AssignmentGradeRepository gradeRepository;
    private final AssignmentSubmissionRepository submissionRepository;
    private final AssignmentRepository assignmentRepository;
    private final UserRepository userRepository;
    private final MessagingService messagingService;
    private final GradebookService gradebookService;

    @Transactional
    public AssignmentGrade gradeSubmission(String submissionId, AssignmentGrade grade) {
        AssignmentSubmission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found"));
        
        User currentUser = getCurrentUser();
        
        // Check permissions
        if (!currentUser.isAdmin() && !submission.getAssignment().getCreatedBy().getId().equals(currentUser.getId())) {
            throw new BadRequestException("You can only grade submissions for your own assignments");
        }

        // Check if already graded
        if (gradeRepository.existsBySubmission(submission)) {
            throw new BadRequestException("Submission is already graded. Use update grade instead.");
        }

        // Set grade properties
        grade.setId(UUID.randomUUID().toString());
        grade.setSubmission(submission);
        grade.setAssignment(submission.getAssignment());
        grade.setStudent(submission.getStudent());
        grade.setGrader(currentUser);
        grade.setPointsPossible(submission.getAssignment().getMaxPoints());
        grade.setGradedAt(LocalDateTime.now());
        grade.setLate(submission.isLate());

        // Calculate percentage
        BigDecimal percentage = calculatePercentage(grade.getPointsEarned(), grade.getPointsPossible());
        grade.setPercentage(percentage);

        // Apply late penalty if applicable
        if (submission.isLate() && submission.getAssignment().getLatePenaltyPercentage() != null) {
            BigDecimal penalty = submission.getAssignment().getLatePenaltyPercentage();
            BigDecimal penaltyAmount = grade.getPointsEarned().multiply(penalty).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            grade.setLatePenaltyApplied(penaltyAmount);
            grade.setPointsEarned(grade.getPointsEarned().subtract(penaltyAmount));
            grade.setPercentage(calculatePercentage(grade.getPointsEarned(), grade.getPointsPossible()));
        }

        // Calculate letter grade
        grade.setLetterGrade(calculateLetterGrade(grade.getPercentage()));

        // Update submission status
        submission.setStatus(AssignmentSubmission.SubmissionStatus.GRADED);
        submissionRepository.save(submission);

        AssignmentGrade savedGrade = gradeRepository.save(grade);
        
        log.info("Assignment graded: {} for student: {} with grade: {}%", 
                submission.getAssignment().getTitle(), submission.getStudent().getEmail(), grade.getPercentage());

        // Update course grade
        try {
            gradebookService.updateCourseGrade(submission.getAssignment().getCourse().getId(), submission.getStudent().getId());
        } catch (Exception e) {
            log.error("Failed to update course grade", e);
        }

        return savedGrade;
    }

    @Transactional
    @CacheEvict(value = "grades", allEntries = true)
    public AssignmentGrade updateGrade(String gradeId, AssignmentGrade gradeUpdate) {
        AssignmentGrade existingGrade = getGradeById(gradeId);
        User currentUser = getCurrentUser();
        
        // Check permissions
        if (!currentUser.isAdmin() && !existingGrade.getAssignment().getCreatedBy().getId().equals(currentUser.getId())) {
            throw new BadRequestException("You can only update grades for your own assignments");
        }

        // Update grade fields
        existingGrade.setPointsEarned(gradeUpdate.getPointsEarned());
        existingGrade.setFeedback(gradeUpdate.getFeedback());
        existingGrade.setRubricScores(gradeUpdate.getRubricScores());
        existingGrade.setExcused(gradeUpdate.isExcused());
        existingGrade.setGradeStatus(gradeUpdate.getGradeStatus());

        // Recalculate percentage
        if (!existingGrade.isExcused()) {
            BigDecimal percentage = calculatePercentage(existingGrade.getPointsEarned(), existingGrade.getPointsPossible());
            existingGrade.setPercentage(percentage);
            
            // Reapply late penalty if applicable
            if (existingGrade.isLate() && existingGrade.getAssignment().getLatePenaltyPercentage() != null) {
                BigDecimal penalty = existingGrade.getAssignment().getLatePenaltyPercentage();
                BigDecimal penaltyAmount = gradeUpdate.getPointsEarned().multiply(penalty).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
                existingGrade.setLatePenaltyApplied(penaltyAmount);
                existingGrade.setPointsEarned(existingGrade.getPointsEarned().subtract(penaltyAmount));
                existingGrade.setPercentage(calculatePercentage(existingGrade.getPointsEarned(), existingGrade.getPointsPossible()));
            }
            
            existingGrade.setLetterGrade(calculateLetterGrade(existingGrade.getPercentage()));
        } else {
            existingGrade.setPercentage(BigDecimal.ZERO);
            existingGrade.setLetterGrade("EX");
        }

        AssignmentGrade savedGrade = gradeRepository.save(existingGrade);
        
        log.info("Assignment grade updated: {} for student: {}", 
                existingGrade.getAssignment().getTitle(), existingGrade.getStudent().getEmail());

        // Update course grade
        try {
            gradebookService.updateCourseGrade(existingGrade.getAssignment().getCourse().getId(), existingGrade.getStudent().getId());
        } catch (Exception e) {
            log.error("Failed to update course grade", e);
        }

        return savedGrade;
    }

    @Transactional
    @CacheEvict(value = "grades", allEntries = true)
    public AssignmentGrade releaseGrade(String gradeId) {
        AssignmentGrade grade = getGradeById(gradeId);
        User currentUser = getCurrentUser();
        
        // Check permissions
        if (!currentUser.isAdmin() && !grade.getAssignment().getCreatedBy().getId().equals(currentUser.getId())) {
            throw new BadRequestException("You can only release grades for your own assignments");
        }

        grade.setReleased(true);
        grade.setReleasedAt(LocalDateTime.now());
        grade.setGradeStatus(AssignmentGrade.GradeStatus.RELEASED);

        AssignmentGrade savedGrade = gradeRepository.save(grade);
        
        log.info("Grade released for assignment: {} to student: {}", 
                grade.getAssignment().getTitle(), grade.getStudent().getEmail());

        // Send notification to student
        try {
            messagingService.sendGradeReleasedNotification(savedGrade);
        } catch (Exception e) {
            log.error("Failed to send grade released notification", e);
        }

        return savedGrade;
    }

    @Transactional
    @CacheEvict(value = "grades", allEntries = true)
    public void releaseAllGrades(String assignmentId) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));
        
        User currentUser = getCurrentUser();
        
        // Check permissions
        if (!currentUser.isAdmin() && !assignment.getCreatedBy().getId().equals(currentUser.getId())) {
            throw new BadRequestException("You can only release grades for your own assignments");
        }

        List<AssignmentGrade> grades = gradeRepository.findByAssignmentAndIsReleasedTrue(assignment);
        LocalDateTime now = LocalDateTime.now();
        
        for (AssignmentGrade grade : grades) {
            if (!grade.isReleased()) {
                grade.setReleased(true);
                grade.setReleasedAt(now);
                grade.setGradeStatus(AssignmentGrade.GradeStatus.RELEASED);
                gradeRepository.save(grade);
                
                // Send notification to student
                try {
                    messagingService.sendGradeReleasedNotification(grade);
                } catch (Exception e) {
                    log.error("Failed to send grade released notification", e);
                }
            }
        }
        
        log.info("All grades released for assignment: {}", assignment.getTitle());
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "grades", key = "#gradeId")
    public AssignmentGrade getGradeById(String gradeId) {
        return gradeRepository.findById(gradeId)
                .orElseThrow(() -> new ResourceNotFoundException("Grade not found"));
    }

    @Transactional(readOnly = true)
    public Optional<AssignmentGrade> getGradeBySubmission(String submissionId) {
        AssignmentSubmission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found"));
        
        return gradeRepository.findBySubmission(submission);
    }

    @Transactional(readOnly = true)
    public Page<AssignmentGrade> getGradesByAssignment(String assignmentId, Pageable pageable) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));
        
        User currentUser = getCurrentUser();
        
        // Check permissions
        if (!currentUser.isAdmin() && !assignment.getCreatedBy().getId().equals(currentUser.getId())) {
            throw new BadRequestException("You can only view grades for your own assignments");
        }

        return gradeRepository.findByAssignment(assignment, pageable);
    }

    @Transactional(readOnly = true)
    public Page<AssignmentGrade> getStudentGrades(String studentId, Pageable pageable) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        
        User currentUser = getCurrentUser();
        
        // Check permissions
        if (!currentUser.isAdmin() && !currentUser.getId().equals(studentId)) {
            throw new BadRequestException("You can only view your own grades");
        }

        return gradeRepository.findByStudent(student, pageable);
    }

    @Transactional(readOnly = true)
    public List<AssignmentGrade> getReleasedGrades(String studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        
        User currentUser = getCurrentUser();
        
        // Check permissions
        if (!currentUser.isAdmin() && !currentUser.getId().equals(studentId)) {
            throw new BadRequestException("You can only view your own grades");
        }

        return gradeRepository.findByStudentAndIsReleasedTrueOrderByGradedAtDesc(student);
    }

    @Transactional(readOnly = true)
    public Optional<BigDecimal> getAverageGradeForAssignment(String assignmentId) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));
        
        return gradeRepository.findAverageGradeByAssignment(assignment);
    }

    @Transactional(readOnly = true)
    public Optional<BigDecimal> getStudentAverageInCourse(String studentId, String courseId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        
        return gradeRepository.findAverageGradeByStudentAndCourse(student, courseId);
    }

    private BigDecimal calculatePercentage(BigDecimal pointsEarned, BigDecimal pointsPossible) {
        if (pointsPossible.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        
        return pointsEarned.multiply(BigDecimal.valueOf(100))
                .divide(pointsPossible, 2, RoundingMode.HALF_UP);
    }

    private String calculateLetterGrade(BigDecimal percentage) {
        if (percentage.compareTo(BigDecimal.valueOf(97)) >= 0) return "A+";
        if (percentage.compareTo(BigDecimal.valueOf(93)) >= 0) return "A";
        if (percentage.compareTo(BigDecimal.valueOf(90)) >= 0) return "A-";
        if (percentage.compareTo(BigDecimal.valueOf(87)) >= 0) return "B+";
        if (percentage.compareTo(BigDecimal.valueOf(83)) >= 0) return "B";
        if (percentage.compareTo(BigDecimal.valueOf(80)) >= 0) return "B-";
        if (percentage.compareTo(BigDecimal.valueOf(77)) >= 0) return "C+";
        if (percentage.compareTo(BigDecimal.valueOf(73)) >= 0) return "C";
        if (percentage.compareTo(BigDecimal.valueOf(70)) >= 0) return "C-";
        if (percentage.compareTo(BigDecimal.valueOf(67)) >= 0) return "D+";
        if (percentage.compareTo(BigDecimal.valueOf(63)) >= 0) return "D";
        if (percentage.compareTo(BigDecimal.valueOf(60)) >= 0) return "D-";
        return "F";
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
