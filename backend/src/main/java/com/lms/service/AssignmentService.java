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
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final GradebookCategoryRepository gradebookCategoryRepository;
    private final RubricRepository rubricRepository;
    private final MessagingService messagingService;

    @Transactional
    public Assignment createAssignment(Assignment assignment) {
        User currentUser = getCurrentUser();
        
        if (!currentUser.isInstructor() && !currentUser.isAdmin()) {
            throw new BadRequestException("Only instructors and admins can create assignments");
        }

        // Validate course
        Course course = courseRepository.findById(assignment.getCourse().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        
        // Check if user can create assignments for this course
        if (!currentUser.isAdmin() && !course.getInstructor().getId().equals(currentUser.getId())) {
            throw new BadRequestException("You can only create assignments for your own courses");
        }

        // Set assignment properties
        assignment.setId(UUID.randomUUID().toString());
        assignment.setCourse(course);
        assignment.setCreatedBy(currentUser);
        
        // Validate and set gradebook category if provided
        if (assignment.getGradebookCategory() != null && assignment.getGradebookCategory().getId() != null) {
            GradebookCategory category = gradebookCategoryRepository.findById(assignment.getGradebookCategory().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Gradebook category not found"));
            
            if (!category.getCourse().getId().equals(course.getId())) {
                throw new BadRequestException("Gradebook category must belong to the same course");
            }
            assignment.setGradebookCategory(category);
        }
        
        // Validate and set rubric if provided
        if (assignment.getRubric() != null && assignment.getRubric().getId() != null) {
            Rubric rubric = rubricRepository.findById(assignment.getRubric().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Rubric not found"));
            
            if (!rubric.getCourse().getId().equals(course.getId())) {
                throw new BadRequestException("Rubric must belong to the same course");
            }
            assignment.setRubric(rubric);
        }

        // Validate dates
        validateAssignmentDates(assignment);

        Assignment savedAssignment = assignmentRepository.save(assignment);
        
        log.info("Assignment created: {} for course: {}", savedAssignment.getTitle(), course.getTitle());
        
        return savedAssignment;
    }

    @Transactional
    @CacheEvict(value = "assignments", allEntries = true)
    public Assignment updateAssignment(String assignmentId, Assignment assignmentUpdate) {
        Assignment existingAssignment = getAssignmentById(assignmentId);
        User currentUser = getCurrentUser();
        
        // Check permissions
        if (!currentUser.isAdmin() && !existingAssignment.getCreatedBy().getId().equals(currentUser.getId())) {
            throw new BadRequestException("You can only update your own assignments");
        }

        // Update fields
        existingAssignment.setTitle(assignmentUpdate.getTitle());
        existingAssignment.setDescription(assignmentUpdate.getDescription());
        existingAssignment.setInstructions(assignmentUpdate.getInstructions());
        existingAssignment.setAssignmentType(assignmentUpdate.getAssignmentType());
        existingAssignment.setMaxPoints(assignmentUpdate.getMaxPoints());
        existingAssignment.setDueDate(assignmentUpdate.getDueDate());
        existingAssignment.setAvailableFrom(assignmentUpdate.getAvailableFrom());
        existingAssignment.setAvailableUntil(assignmentUpdate.getAvailableUntil());
        existingAssignment.setAllowLateSubmission(assignmentUpdate.isAllowLateSubmission());
        existingAssignment.setLatePenaltyPercentage(assignmentUpdate.getLatePenaltyPercentage());
        existingAssignment.setMaxAttempts(assignmentUpdate.getMaxAttempts());
        existingAssignment.setTimeLimitMinutes(assignmentUpdate.getTimeLimitMinutes());
        existingAssignment.setSubmissionFormat(assignmentUpdate.getSubmissionFormat());
        existingAssignment.setRequiredFiles(assignmentUpdate.getRequiredFiles());
        existingAssignment.setMaxFileSizeMb(assignmentUpdate.getMaxFileSizeMb());
        existingAssignment.setAutoGrade(assignmentUpdate.isAutoGrade());
        existingAssignment.setGroupAssignment(assignmentUpdate.isGroupAssignment());
        existingAssignment.setMaxGroupSize(assignmentUpdate.getMaxGroupSize());
        existingAssignment.setPeerReviewEnabled(assignmentUpdate.isPeerReviewEnabled());
        existingAssignment.setPeerReviewCount(assignmentUpdate.getPeerReviewCount());
        existingAssignment.setShowRubricToStudents(assignmentUpdate.isShowRubricToStudents());
        existingAssignment.setPlagiarismCheckEnabled(assignmentUpdate.isPlagiarismCheckEnabled());

        // Update gradebook category if provided
        if (assignmentUpdate.getGradebookCategory() != null && assignmentUpdate.getGradebookCategory().getId() != null) {
            GradebookCategory category = gradebookCategoryRepository.findById(assignmentUpdate.getGradebookCategory().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Gradebook category not found"));
            existingAssignment.setGradebookCategory(category);
        }

        // Update rubric if provided
        if (assignmentUpdate.getRubric() != null && assignmentUpdate.getRubric().getId() != null) {
            Rubric rubric = rubricRepository.findById(assignmentUpdate.getRubric().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Rubric not found"));
            existingAssignment.setRubric(rubric);
        }

        // Validate dates
        validateAssignmentDates(existingAssignment);

        Assignment savedAssignment = assignmentRepository.save(existingAssignment);
        
        log.info("Assignment updated: {}", savedAssignment.getTitle());
        
        return savedAssignment;
    }

    @Transactional
    @CacheEvict(value = "assignments", allEntries = true)
    public Assignment publishAssignment(String assignmentId) {
        Assignment assignment = getAssignmentById(assignmentId);
        User currentUser = getCurrentUser();
        
        // Check permissions
        if (!currentUser.isAdmin() && !assignment.getCreatedBy().getId().equals(currentUser.getId())) {
            throw new BadRequestException("You can only publish your own assignments");
        }

        assignment.setPublished(true);
        Assignment savedAssignment = assignmentRepository.save(assignment);
        
        log.info("Assignment published: {}", savedAssignment.getTitle());
        
        // Send notification to enrolled students
        try {
            messagingService.sendAssignmentPublishedNotification(savedAssignment);
        } catch (Exception e) {
            log.error("Failed to send assignment published notification", e);
        }
        
        return savedAssignment;
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "assignments", key = "#assignmentId")
    public Assignment getAssignmentById(String assignmentId) {
        return assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));
    }

    @Transactional(readOnly = true)
    public Page<Assignment> getAssignmentsByCourse(String courseId, Pageable pageable) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        
        User currentUser = getCurrentUser();
        
        // Students can only see published assignments
        if (currentUser.isStudent()) {
            return assignmentRepository.findByCourseAndIsPublishedTrue(course, pageable);
        }
        
        // Instructors can see all assignments for their courses
        if (currentUser.isInstructor() && course.getInstructor().getId().equals(currentUser.getId())) {
            return assignmentRepository.findByCourse(course, pageable);
        }
        
        // Admins can see all assignments
        if (currentUser.isAdmin()) {
            return assignmentRepository.findByCourse(course, pageable);
        }
        
        throw new BadRequestException("You don't have permission to view assignments for this course");
    }

    @Transactional(readOnly = true)
    public List<Assignment> getUpcomingAssignments(String courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime nextWeek = now.plusWeeks(1);
        
        return assignmentRepository.findUpcomingAssignments(course, now, nextWeek);
    }

    @Transactional(readOnly = true)
    public List<Assignment> getOverdueAssignments(String courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        
        return assignmentRepository.findOverdueAssignments(course, LocalDateTime.now());
    }

    @Transactional(readOnly = true)
    public List<Assignment> getAvailableAssignments(String courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        
        return assignmentRepository.findAvailableAssignments(course, LocalDateTime.now());
    }

    @Transactional(readOnly = true)
    public Page<Assignment> getInstructorAssignments(Pageable pageable) {
        User currentUser = getCurrentUser();
        
        if (!currentUser.isInstructor() && !currentUser.isAdmin()) {
            throw new BadRequestException("Only instructors can view their assignments");
        }
        
        return assignmentRepository.findByCreatedBy(currentUser, pageable);
    }

    @Transactional(readOnly = true)
    public List<Assignment> getAssignmentsRequiringGrading(String courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        
        User currentUser = getCurrentUser();
        
        // Check permissions
        if (!currentUser.isAdmin() && !course.getInstructor().getId().equals(currentUser.getId())) {
            throw new BadRequestException("You can only view grading requirements for your own courses");
        }
        
        return assignmentRepository.findAssignmentsRequiringGrading(course);
    }

    @Transactional
    @CacheEvict(value = "assignments", key = "#assignmentId")
    public void deleteAssignment(String assignmentId) {
        Assignment assignment = getAssignmentById(assignmentId);
        User currentUser = getCurrentUser();
        
        // Check permissions
        if (!currentUser.isAdmin() && !assignment.getCreatedBy().getId().equals(currentUser.getId())) {
            throw new BadRequestException("You can only delete your own assignments");
        }

        // Check if assignment has submissions
        if (!assignment.getSubmissions().isEmpty()) {
            throw new BadRequestException("Cannot delete assignment with existing submissions");
        }

        assignmentRepository.delete(assignment);
        
        log.info("Assignment deleted: {}", assignment.getTitle());
    }

    @Transactional(readOnly = true)
    public Page<Assignment> searchAssignments(String courseId, String searchTerm, Pageable pageable) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        
        return assignmentRepository.searchAssignments(course, searchTerm, pageable);
    }

    private void validateAssignmentDates(Assignment assignment) {
        LocalDateTime now = LocalDateTime.now();
        
        if (assignment.getAvailableFrom() != null && assignment.getAvailableUntil() != null) {
            if (assignment.getAvailableFrom().isAfter(assignment.getAvailableUntil())) {
                throw new BadRequestException("Available from date must be before available until date");
            }
        }
        
        if (assignment.getDueDate() != null) {
            if (assignment.getAvailableFrom() != null && assignment.getDueDate().isBefore(assignment.getAvailableFrom())) {
                throw new BadRequestException("Due date must be after available from date");
            }
            
            if (assignment.getAvailableUntil() != null && assignment.getDueDate().isAfter(assignment.getAvailableUntil())) {
                throw new BadRequestException("Due date must be before available until date");
            }
        }
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
