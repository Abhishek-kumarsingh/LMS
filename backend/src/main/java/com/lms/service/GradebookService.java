package com.lms.service;

import com.lms.entity.*;
import com.lms.exception.BadRequestException;
import com.lms.exception.ResourceNotFoundException;
import com.lms.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class GradebookService {

    private final CourseGradeRepository courseGradeRepository;
    private final GradebookCategoryRepository categoryRepository;
    private final AssignmentGradeRepository assignmentGradeRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;

    @Transactional
    public GradebookCategory createCategory(String courseId, GradebookCategory category) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        
        User currentUser = getCurrentUser();
        
        // Check permissions
        if (!currentUser.isAdmin() && !course.getInstructor().getId().equals(currentUser.getId())) {
            throw new BadRequestException("You can only create categories for your own courses");
        }

        // Check if category name already exists
        if (categoryRepository.existsByCourseAndName(course, category.getName())) {
            throw new BadRequestException("Category with this name already exists in the course");
        }

        // Set category properties
        category.setId(UUID.randomUUID().toString());
        category.setCourse(course);
        category.setCategoryOrder(categoryRepository.findNextOrderIndex(course));

        GradebookCategory savedCategory = categoryRepository.save(category);
        
        log.info("Gradebook category created: {} for course: {}", savedCategory.getName(), course.getTitle());
        
        return savedCategory;
    }

    @Transactional
    @CacheEvict(value = "gradebook", allEntries = true)
    public GradebookCategory updateCategory(String categoryId, GradebookCategory categoryUpdate) {
        GradebookCategory existingCategory = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        
        User currentUser = getCurrentUser();
        
        // Check permissions
        if (!currentUser.isAdmin() && !existingCategory.getCourse().getInstructor().getId().equals(currentUser.getId())) {
            throw new BadRequestException("You can only update categories for your own courses");
        }

        // Update fields
        existingCategory.setName(categoryUpdate.getName());
        existingCategory.setDescription(categoryUpdate.getDescription());
        existingCategory.setWeightPercentage(categoryUpdate.getWeightPercentage());
        existingCategory.setDropLowest(categoryUpdate.getDropLowest());
        existingCategory.setActive(categoryUpdate.isActive());

        GradebookCategory savedCategory = categoryRepository.save(existingCategory);
        
        // Recalculate all course grades for this course
        recalculateAllCourseGrades(existingCategory.getCourse().getId());
        
        log.info("Gradebook category updated: {}", savedCategory.getName());
        
        return savedCategory;
    }

    @Transactional(readOnly = true)
    public List<GradebookCategory> getCategoriesByCourse(String courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        
        return categoryRepository.findByCourseAndIsActiveTrueOrderByCategoryOrderAsc(course);
    }

    @Transactional
    @CacheEvict(value = "gradebook", allEntries = true)
    public CourseGrade updateCourseGrade(String courseId, String studentId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        // Get or create course grade
        CourseGrade courseGrade = courseGradeRepository.findByCourseAndStudent(course, student)
                .orElse(new CourseGrade());

        if (courseGrade.getId() == null) {
            courseGrade.setId(UUID.randomUUID().toString());
            courseGrade.setCourse(course);
            courseGrade.setStudent(student);
        }

        // Calculate weighted grade
        BigDecimal calculatedGrade = calculateWeightedGrade(course, student);
        courseGrade.setCurrentGrade(calculatedGrade);
        courseGrade.setLetterGrade(calculateLetterGrade(calculatedGrade));
        courseGrade.setGradePoints(calculateGradePoints(calculatedGrade));
        courseGrade.setPassing(calculatedGrade.compareTo(BigDecimal.valueOf(60)) >= 0);
        courseGrade.setLastCalculated(LocalDateTime.now());

        // Check if course is complete
        if (isStudentCourseComplete(course, student)) {
            courseGrade.setComplete(true);
            courseGrade.setFinalGrade(calculatedGrade);
            if (courseGrade.getCompletionDate() == null) {
                courseGrade.setCompletionDate(LocalDateTime.now());
            }
        }

        CourseGrade savedGrade = courseGradeRepository.save(courseGrade);
        
        log.info("Course grade updated for student: {} in course: {} - Grade: {}%", 
                student.getEmail(), course.getTitle(), calculatedGrade);
        
        return savedGrade;
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "gradebook", key = "'course-grade:' + #courseId + ':' + #studentId")
    public Optional<CourseGrade> getCourseGrade(String courseId, String studentId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        return courseGradeRepository.findByCourseAndStudent(course, student);
    }

    @Transactional(readOnly = true)
    public List<CourseGrade> getAllCourseGrades(String courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        
        User currentUser = getCurrentUser();
        
        // Check permissions
        if (!currentUser.isAdmin() && !course.getInstructor().getId().equals(currentUser.getId())) {
            throw new BadRequestException("You can only view grades for your own courses");
        }

        return courseGradeRepository.findByCourseOrderByCurrentGradeDesc(course);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getCourseGradeStatistics(String courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        
        User currentUser = getCurrentUser();
        
        // Check permissions
        if (!currentUser.isAdmin() && !course.getInstructor().getId().equals(currentUser.getId())) {
            throw new BadRequestException("You can only view statistics for your own courses");
        }

        Map<String, Object> stats = new HashMap<>();
        
        // Basic statistics
        Optional<BigDecimal> avgGrade = courseGradeRepository.findAverageGradeByCourse(course);
        Optional<BigDecimal> highestGrade = courseGradeRepository.findHighestGradeByCourse(course);
        Optional<BigDecimal> lowestGrade = courseGradeRepository.findLowestGradeByCourse(course);
        
        stats.put("averageGrade", avgGrade.orElse(BigDecimal.ZERO));
        stats.put("highestGrade", highestGrade.orElse(BigDecimal.ZERO));
        stats.put("lowestGrade", lowestGrade.orElse(BigDecimal.ZERO));
        
        // Grade distribution
        stats.put("aGrades", courseGradeRepository.countByGradeRange(course, BigDecimal.valueOf(90), BigDecimal.valueOf(100)));
        stats.put("bGrades", courseGradeRepository.countByGradeRange(course, BigDecimal.valueOf(80), BigDecimal.valueOf(89.99)));
        stats.put("cGrades", courseGradeRepository.countByGradeRange(course, BigDecimal.valueOf(70), BigDecimal.valueOf(79.99)));
        stats.put("dGrades", courseGradeRepository.countByGradeRange(course, BigDecimal.valueOf(60), BigDecimal.valueOf(69.99)));
        stats.put("fGrades", courseGradeRepository.countByGradeRange(course, BigDecimal.valueOf(0), BigDecimal.valueOf(59.99)));
        
        // Completion statistics
        stats.put("totalStudents", courseGradeRepository.countByCourse(course));
        stats.put("passingStudents", courseGradeRepository.countByCourseAndIsPassingTrue(course));
        stats.put("completedStudents", courseGradeRepository.countByCourseAndIsCompleteTrue(course));
        
        return stats;
    }

    @Transactional
    public void recalculateAllCourseGrades(String courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        
        User currentUser = getCurrentUser();
        
        // Check permissions
        if (!currentUser.isAdmin() && !course.getInstructor().getId().equals(currentUser.getId())) {
            throw new BadRequestException("You can only recalculate grades for your own courses");
        }

        // Get all enrolled students
        List<Enrollment> enrollments = enrollmentRepository.findByCourse(course);
        
        for (Enrollment enrollment : enrollments) {
            try {
                updateCourseGrade(courseId, enrollment.getUser().getId());
            } catch (Exception e) {
                log.error("Failed to recalculate grade for student: {} in course: {}", 
                         enrollment.getUser().getEmail(), course.getTitle(), e);
            }
        }
        
        log.info("Recalculated all course grades for course: {}", course.getTitle());
    }

    @Transactional(readOnly = true)
    public List<CourseGrade> getStudentsNeedingAttention(String courseId, BigDecimal threshold) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        
        User currentUser = getCurrentUser();
        
        // Check permissions
        if (!currentUser.isAdmin() && !course.getInstructor().getId().equals(currentUser.getId())) {
            throw new BadRequestException("You can only view student data for your own courses");
        }

        return courseGradeRepository.findStudentsNeedingAttention(course, threshold);
    }

    private BigDecimal calculateWeightedGrade(Course course, User student) {
        List<GradebookCategory> categories = categoryRepository.findByCourseAndIsActiveTrueOrderByCategoryOrderAsc(course);
        
        if (categories.isEmpty()) {
            // No categories, calculate simple average
            return calculateSimpleAverage(course, student);
        }

        BigDecimal totalWeightedPoints = BigDecimal.ZERO;
        BigDecimal totalWeight = BigDecimal.ZERO;

        for (GradebookCategory category : categories) {
            BigDecimal categoryGrade = calculateCategoryGrade(category, student);
            if (categoryGrade != null) {
                BigDecimal weight = category.getWeightPercentage();
                totalWeightedPoints = totalWeightedPoints.add(categoryGrade.multiply(weight));
                totalWeight = totalWeight.add(weight);
            }
        }

        if (totalWeight.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }

        return totalWeightedPoints.divide(totalWeight, 2, RoundingMode.HALF_UP);
    }

    private BigDecimal calculateCategoryGrade(GradebookCategory category, User student) {
        // Get all assignment grades for this category and student
        List<Assignment> assignments = category.getAssignments().stream()
                .filter(Assignment::isPublished)
                .collect(Collectors.toList());

        if (assignments.isEmpty()) {
            return null;
        }

        List<BigDecimal> grades = new ArrayList<>();
        
        for (Assignment assignment : assignments) {
            Optional<AssignmentGrade> gradeOpt = assignmentGradeRepository.findBySubmission(
                assignment.getSubmissions().stream()
                    .filter(s -> s.getStudent().getId().equals(student.getId()))
                    .findFirst()
                    .orElse(null)
            );
            
            if (gradeOpt.isPresent() && !gradeOpt.get().isExcused()) {
                grades.add(gradeOpt.get().getPercentage());
            }
        }

        if (grades.isEmpty()) {
            return BigDecimal.ZERO;
        }

        // Apply drop lowest rule
        if (category.getDropLowest() != null && category.getDropLowest() > 0 && grades.size() > category.getDropLowest()) {
            grades.sort(BigDecimal::compareTo);
            for (int i = 0; i < category.getDropLowest() && !grades.isEmpty(); i++) {
                grades.remove(0); // Remove lowest grade
            }
        }

        // Calculate average
        BigDecimal sum = grades.stream().reduce(BigDecimal.ZERO, BigDecimal::add);
        return sum.divide(BigDecimal.valueOf(grades.size()), 2, RoundingMode.HALF_UP);
    }

    private BigDecimal calculateSimpleAverage(Course course, User student) {
        Optional<BigDecimal> average = assignmentGradeRepository.findAverageGradeByStudentAndCourse(student, course.getId());
        return average.orElse(BigDecimal.ZERO);
    }

    private boolean isStudentCourseComplete(Course course, User student) {
        // Check if student has completed all required assignments
        // This is a simplified check - you might want to add more sophisticated completion criteria
        Optional<Enrollment> enrollment = enrollmentRepository.findByUserAndCourse(student, course);
        return enrollment.isPresent() && enrollment.get().getProgressPercentage().compareTo(BigDecimal.valueOf(100)) >= 0;
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

    private BigDecimal calculateGradePoints(BigDecimal percentage) {
        if (percentage.compareTo(BigDecimal.valueOf(97)) >= 0) return BigDecimal.valueOf(4.0);
        if (percentage.compareTo(BigDecimal.valueOf(93)) >= 0) return BigDecimal.valueOf(4.0);
        if (percentage.compareTo(BigDecimal.valueOf(90)) >= 0) return BigDecimal.valueOf(3.7);
        if (percentage.compareTo(BigDecimal.valueOf(87)) >= 0) return BigDecimal.valueOf(3.3);
        if (percentage.compareTo(BigDecimal.valueOf(83)) >= 0) return BigDecimal.valueOf(3.0);
        if (percentage.compareTo(BigDecimal.valueOf(80)) >= 0) return BigDecimal.valueOf(2.7);
        if (percentage.compareTo(BigDecimal.valueOf(77)) >= 0) return BigDecimal.valueOf(2.3);
        if (percentage.compareTo(BigDecimal.valueOf(73)) >= 0) return BigDecimal.valueOf(2.0);
        if (percentage.compareTo(BigDecimal.valueOf(70)) >= 0) return BigDecimal.valueOf(1.7);
        if (percentage.compareTo(BigDecimal.valueOf(67)) >= 0) return BigDecimal.valueOf(1.3);
        if (percentage.compareTo(BigDecimal.valueOf(63)) >= 0) return BigDecimal.valueOf(1.0);
        if (percentage.compareTo(BigDecimal.valueOf(60)) >= 0) return BigDecimal.valueOf(0.7);
        return BigDecimal.valueOf(0.0);
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
