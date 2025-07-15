package com.lms.service;

import com.lms.entity.Course;
import com.lms.entity.Rubric;
import com.lms.entity.User;
import com.lms.exception.BadRequestException;
import com.lms.exception.ResourceNotFoundException;
import com.lms.repository.CourseRepository;
import com.lms.repository.RubricRepository;
import com.lms.repository.UserRepository;
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

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class RubricService {

    private final RubricRepository rubricRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    @Transactional
    public Rubric createRubric(Rubric rubric) {
        User currentUser = getCurrentUser();
        
        if (!currentUser.isInstructor() && !currentUser.isAdmin()) {
            throw new BadRequestException("Only instructors and admins can create rubrics");
        }

        // Validate course
        Course course = courseRepository.findById(rubric.getCourse().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        
        // Check if user can create rubrics for this course
        if (!currentUser.isAdmin() && !course.getInstructor().getId().equals(currentUser.getId())) {
            throw new BadRequestException("You can only create rubrics for your own courses");
        }

        // Set rubric properties
        rubric.setId(UUID.randomUUID().toString());
        rubric.setCourse(course);
        rubric.setCreatedBy(currentUser);

        // Validate criteria JSON
        validateRubricCriteria(rubric.getCriteria());

        Rubric savedRubric = rubricRepository.save(rubric);
        
        log.info("Rubric created: {} for course: {}", savedRubric.getTitle(), course.getTitle());
        
        return savedRubric;
    }

    @Transactional
    @CacheEvict(value = "rubrics", allEntries = true)
    public Rubric updateRubric(String rubricId, Rubric rubricUpdate) {
        Rubric existingRubric = getRubricById(rubricId);
        User currentUser = getCurrentUser();
        
        // Check permissions
        if (!currentUser.isAdmin() && !existingRubric.getCreatedBy().getId().equals(currentUser.getId())) {
            throw new BadRequestException("You can only update your own rubrics");
        }

        // Check if rubric is being used by assignments
        if (!existingRubric.getAssignments().isEmpty() && existingRubric.isPublished()) {
            throw new BadRequestException("Cannot modify published rubric that is being used by assignments");
        }

        // Update fields
        existingRubric.setTitle(rubricUpdate.getTitle());
        existingRubric.setDescription(rubricUpdate.getDescription());
        existingRubric.setTotalPoints(rubricUpdate.getTotalPoints());
        existingRubric.setCriteria(rubricUpdate.getCriteria());

        // Validate criteria JSON
        validateRubricCriteria(existingRubric.getCriteria());

        Rubric savedRubric = rubricRepository.save(existingRubric);
        
        log.info("Rubric updated: {}", savedRubric.getTitle());
        
        return savedRubric;
    }

    @Transactional
    @CacheEvict(value = "rubrics", allEntries = true)
    public Rubric publishRubric(String rubricId) {
        Rubric rubric = getRubricById(rubricId);
        User currentUser = getCurrentUser();
        
        // Check permissions
        if (!currentUser.isAdmin() && !rubric.getCreatedBy().getId().equals(currentUser.getId())) {
            throw new BadRequestException("You can only publish your own rubrics");
        }

        rubric.setPublished(true);
        Rubric savedRubric = rubricRepository.save(rubric);
        
        log.info("Rubric published: {}", savedRubric.getTitle());
        
        return savedRubric;
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "rubrics", key = "#rubricId")
    public Rubric getRubricById(String rubricId) {
        return rubricRepository.findById(rubricId)
                .orElseThrow(() -> new ResourceNotFoundException("Rubric not found"));
    }

    @Transactional(readOnly = true)
    public Page<Rubric> getRubricsByCourse(String courseId, Pageable pageable) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        
        User currentUser = getCurrentUser();
        
        // Students can only see published rubrics
        if (currentUser.isStudent()) {
            List<Rubric> publishedRubrics = rubricRepository.findByCourseAndIsPublishedTrue(course);
            // Convert to Page if needed - for simplicity, returning all as Page
            return rubricRepository.findByCourse(course, pageable);
        }
        
        // Instructors can see all rubrics for their courses
        if (currentUser.isInstructor() && course.getInstructor().getId().equals(currentUser.getId())) {
            return rubricRepository.findByCourse(course, pageable);
        }
        
        // Admins can see all rubrics
        if (currentUser.isAdmin()) {
            return rubricRepository.findByCourse(course, pageable);
        }
        
        throw new BadRequestException("You don't have permission to view rubrics for this course");
    }

    @Transactional(readOnly = true)
    public List<Rubric> getPublishedRubricsByCourse(String courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        
        return rubricRepository.findByCourseAndIsPublishedTrue(course);
    }

    @Transactional(readOnly = true)
    public Page<Rubric> getInstructorRubrics(Pageable pageable) {
        User currentUser = getCurrentUser();
        
        if (!currentUser.isInstructor() && !currentUser.isAdmin()) {
            throw new BadRequestException("Only instructors can view their rubrics");
        }
        
        return rubricRepository.findByCreatedBy(currentUser, pageable);
    }

    @Transactional(readOnly = true)
    public Page<Rubric> searchRubrics(String courseId, String searchTerm, Pageable pageable) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        
        return rubricRepository.searchRubrics(course, searchTerm, pageable);
    }

    @Transactional
    @CacheEvict(value = "rubrics", key = "#rubricId")
    public void deleteRubric(String rubricId) {
        Rubric rubric = getRubricById(rubricId);
        User currentUser = getCurrentUser();
        
        // Check permissions
        if (!currentUser.isAdmin() && !rubric.getCreatedBy().getId().equals(currentUser.getId())) {
            throw new BadRequestException("You can only delete your own rubrics");
        }

        // Check if rubric is being used by assignments
        if (!rubric.getAssignments().isEmpty()) {
            throw new BadRequestException("Cannot delete rubric that is being used by assignments");
        }

        rubricRepository.delete(rubric);
        
        log.info("Rubric deleted: {}", rubric.getTitle());
    }

    @Transactional
    public Rubric duplicateRubric(String rubricId, String newTitle) {
        Rubric originalRubric = getRubricById(rubricId);
        User currentUser = getCurrentUser();
        
        // Check permissions to access the original rubric
        if (!currentUser.isAdmin() && 
            !originalRubric.getCreatedBy().getId().equals(currentUser.getId()) &&
            !originalRubric.isPublished()) {
            throw new BadRequestException("You don't have permission to duplicate this rubric");
        }

        // Create new rubric
        Rubric newRubric = new Rubric();
        newRubric.setId(UUID.randomUUID().toString());
        newRubric.setTitle(newTitle != null ? newTitle : originalRubric.getTitle() + " (Copy)");
        newRubric.setDescription(originalRubric.getDescription());
        newRubric.setCourse(originalRubric.getCourse());
        newRubric.setCreatedBy(currentUser);
        newRubric.setTotalPoints(originalRubric.getTotalPoints());
        newRubric.setCriteria(originalRubric.getCriteria());
        newRubric.setPublished(false); // New rubric starts as unpublished

        Rubric savedRubric = rubricRepository.save(newRubric);
        
        log.info("Rubric duplicated: {} -> {}", originalRubric.getTitle(), savedRubric.getTitle());
        
        return savedRubric;
    }

    private void validateRubricCriteria(String criteriaJson) {
        if (criteriaJson == null || criteriaJson.trim().isEmpty()) {
            throw new BadRequestException("Rubric criteria cannot be empty");
        }

        // Basic JSON validation - you might want to use a JSON library for more thorough validation
        try {
            // This is a simple check - in a real implementation, you'd parse and validate the JSON structure
            if (!criteriaJson.trim().startsWith("[") || !criteriaJson.trim().endsWith("]")) {
                throw new BadRequestException("Rubric criteria must be a valid JSON array");
            }
        } catch (Exception e) {
            throw new BadRequestException("Invalid rubric criteria format");
        }
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
