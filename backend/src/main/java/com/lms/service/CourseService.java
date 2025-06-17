package com.lms.service;

import com.lms.entity.Category;
import com.lms.entity.Course;
import com.lms.entity.User;
import com.lms.exception.BadRequestException;
import com.lms.exception.ResourceNotFoundException;
import com.lms.repository.CategoryRepository;
import com.lms.repository.CourseRepository;
import com.lms.repository.UserRepository;
import com.lms.service.messaging.MessagingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CourseService {

    private final CourseRepository courseRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService;
    private final MessagingService messagingService;

    public Course createCourse(Course course) {
        User currentUser = getCurrentUser();
        
        if (!currentUser.isInstructor() && !currentUser.isAdmin()) {
            throw new BadRequestException("Only instructors can create courses");
        }

        // Set course properties
        course.setId(UUID.randomUUID().toString());
        course.setInstructor(currentUser);
        course.setPublished(false); // New courses start as unpublished
        
        // Validate category
        if (course.getCategory() != null && course.getCategory().getId() != null) {
            Category category = categoryRepository.findById(course.getCategory().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
            course.setCategory(category);
        }

        Course savedCourse = courseRepository.save(course);
        log.info("Course created: {} by instructor: {}", savedCourse.getTitle(), currentUser.getEmail());
        
        return savedCourse;
    }

    public Course updateCourse(String courseId, Course courseUpdate) {
        Course existingCourse = getCourseById(courseId);
        User currentUser = getCurrentUser();

        // Check permissions
        if (!currentUser.isAdmin() && !existingCourse.getInstructor().getId().equals(currentUser.getId())) {
            throw new BadRequestException("You can only update your own courses");
        }

        // Update fields
        if (courseUpdate.getTitle() != null) {
            existingCourse.setTitle(courseUpdate.getTitle());
        }
        if (courseUpdate.getDescription() != null) {
            existingCourse.setDescription(courseUpdate.getDescription());
        }
        if (courseUpdate.getShortDescription() != null) {
            existingCourse.setShortDescription(courseUpdate.getShortDescription());
        }
        if (courseUpdate.getPrice() != null) {
            existingCourse.setPrice(courseUpdate.getPrice());
        }
        if (courseUpdate.getOriginalPrice() != null) {
            existingCourse.setOriginalPrice(courseUpdate.getOriginalPrice());
        }
        if (courseUpdate.getLevel() != null) {
            existingCourse.setLevel(courseUpdate.getLevel());
        }
        if (courseUpdate.getLanguage() != null) {
            existingCourse.setLanguage(courseUpdate.getLanguage());
        }
        if (courseUpdate.getRequirements() != null) {
            existingCourse.setRequirements(courseUpdate.getRequirements());
        }
        if (courseUpdate.getWhatYouWillLearn() != null) {
            existingCourse.setWhatYouWillLearn(courseUpdate.getWhatYouWillLearn());
        }

        // Update category if provided
        if (courseUpdate.getCategory() != null && courseUpdate.getCategory().getId() != null) {
            Category category = categoryRepository.findById(courseUpdate.getCategory().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
            existingCourse.setCategory(category);
        }

        Course savedCourse = courseRepository.save(existingCourse);
        log.info("Course updated: {}", savedCourse.getTitle());
        
        return savedCourse;
    }

    public Course uploadThumbnail(String courseId, MultipartFile file) throws IOException {
        Course course = getCourseById(courseId);
        User currentUser = getCurrentUser();

        // Check permissions
        if (!currentUser.isAdmin() && !course.getInstructor().getId().equals(currentUser.getId())) {
            throw new BadRequestException("You can only update your own courses");
        }

        String thumbnailUrl = cloudinaryService.uploadImage(file, "course-thumbnails");
        course.setThumbnailUrl(thumbnailUrl);
        
        Course savedCourse = courseRepository.save(course);
        log.info("Thumbnail uploaded for course: {}", savedCourse.getTitle());
        
        return savedCourse;
    }

    public Course uploadPreviewVideo(String courseId, MultipartFile file) throws IOException {
        Course course = getCourseById(courseId);
        User currentUser = getCurrentUser();

        // Check permissions
        if (!currentUser.isAdmin() && !course.getInstructor().getId().equals(currentUser.getId())) {
            throw new BadRequestException("You can only update your own courses");
        }

        String videoUrl = cloudinaryService.uploadVideo(file, "course-previews");
        course.setPreviewVideoUrl(videoUrl);
        
        Course savedCourse = courseRepository.save(course);
        log.info("Preview video uploaded for course: {}", savedCourse.getTitle());
        
        return savedCourse;
    }

    @Transactional(readOnly = true)
    public Course getCourseById(String courseId) {
        return courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
    }

    @Transactional(readOnly = true)
    public Page<Course> getAllPublishedCourses(Pageable pageable) {
        return courseRepository.findByIsPublishedTrueOrderByCreatedAtDesc(pageable);
    }

    @Transactional(readOnly = true)
    public Page<Course> getCoursesByInstructor(String instructorId, Pageable pageable) {
        User instructor = userRepository.findById(instructorId)
                .orElseThrow(() -> new ResourceNotFoundException("Instructor not found"));
        return courseRepository.findByInstructorOrderByCreatedAtDesc(instructor, pageable);
    }

    @Transactional(readOnly = true)
    public Page<Course> getCoursesByCategory(String categoryId, Pageable pageable) {
        return courseRepository.findByCategoryIdAndPublished(categoryId, pageable);
    }

    @Transactional(readOnly = true)
    public Page<Course> searchCourses(String keyword, Pageable pageable) {
        return courseRepository.searchByKeyword(keyword, pageable);
    }

    @Transactional(readOnly = true)
    public Page<Course> getCoursesWithFilters(String categoryId, Course.Level level, 
                                            BigDecimal minPrice, BigDecimal maxPrice, 
                                            String keyword, String sortBy, Pageable pageable) {
        return courseRepository.findWithFilters(categoryId, level, minPrice, maxPrice, keyword, sortBy, pageable);
    }

    @Transactional(readOnly = true)
    public Page<Course> getFeaturedCourses(Pageable pageable) {
        return courseRepository.findByIsFeaturedTrueAndIsPublishedTrueOrderByCreatedAtDesc(pageable);
    }

    @Transactional(readOnly = true)
    public Page<Course> getTopRatedCourses(Pageable pageable) {
        return courseRepository.findTopRatedCourses(pageable);
    }

    @Transactional(readOnly = true)
    public Page<Course> getMostEnrolledCourses(Pageable pageable) {
        return courseRepository.findMostEnrolledCourses(pageable);
    }

    public Course publishCourse(String courseId) {
        Course course = getCourseById(courseId);
        User currentUser = getCurrentUser();

        // Only admin can publish courses or instructor can publish their own
        if (!currentUser.isAdmin() && !course.getInstructor().getId().equals(currentUser.getId())) {
            throw new BadRequestException("You can only publish your own courses");
        }

        course.setPublished(true);
        Course savedCourse = courseRepository.save(course);
        
        log.info("Course published: {}", savedCourse.getTitle());

        // Send course published notification
        try {
            messagingService.sendCoursePublishedEmail(savedCourse);
        } catch (Exception e) {
            log.error("Failed to send course published notification", e);
        }

        return savedCourse;
    }

    public Course unpublishCourse(String courseId) {
        Course course = getCourseById(courseId);
        User currentUser = getCurrentUser();

        // Only admin can unpublish courses
        if (!currentUser.isAdmin()) {
            throw new BadRequestException("Only admin can unpublish courses");
        }

        course.setPublished(false);
        Course savedCourse = courseRepository.save(course);
        
        log.info("Course unpublished: {}", savedCourse.getTitle());
        
        return savedCourse;
    }

    public void deleteCourse(String courseId) {
        Course course = getCourseById(courseId);
        User currentUser = getCurrentUser();

        // Check permissions
        if (!currentUser.isAdmin() && !course.getInstructor().getId().equals(currentUser.getId())) {
            throw new BadRequestException("You can only delete your own courses");
        }

        // Check if course has enrollments
        if (course.getEnrolledCount() > 0) {
            throw new BadRequestException("Cannot delete course with active enrollments");
        }

        courseRepository.delete(course);
        log.info("Course deleted: {}", course.getTitle());
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
