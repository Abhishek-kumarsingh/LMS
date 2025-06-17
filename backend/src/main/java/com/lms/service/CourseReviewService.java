package com.lms.service;

import com.lms.entity.Course;
import com.lms.entity.CourseReview;
import com.lms.entity.User;
import com.lms.exception.BadRequestException;
import com.lms.exception.ResourceNotFoundException;
import com.lms.repository.CourseRepository;
import com.lms.repository.CourseReviewRepository;
import com.lms.repository.EnrollmentRepository;
import com.lms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CourseReviewService {

    private final CourseReviewRepository reviewRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;

    public CourseReview createReview(String courseId, CourseReview review) {
        User currentUser = getCurrentUser();
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        // Check if user is enrolled in the course
        if (!enrollmentRepository.existsByUserAndCourse(currentUser, course)) {
            throw new BadRequestException("You must be enrolled in the course to leave a review");
        }

        // Check if user has already reviewed this course
        if (reviewRepository.existsByUserAndCourse(currentUser, course)) {
            throw new BadRequestException("You have already reviewed this course");
        }

        // Check if user is the instructor of the course
        if (course.getInstructor().getId().equals(currentUser.getId())) {
            throw new BadRequestException("Instructors cannot review their own courses");
        }

        // Validate rating
        if (review.getRating() < 1 || review.getRating() > 5) {
            throw new BadRequestException("Rating must be between 1 and 5");
        }

        // Set review properties
        review.setId(UUID.randomUUID().toString());
        review.setUser(currentUser);
        review.setCourse(course);
        review.setPublished(true);

        CourseReview savedReview = reviewRepository.save(review);

        // Update course rating statistics
        updateCourseRatingStats(course);

        log.info("Review created for course {} by user {}", course.getTitle(), currentUser.getEmail());

        return savedReview;
    }

    public CourseReview updateReview(String reviewId, CourseReview reviewUpdate) {
        CourseReview existingReview = getReviewById(reviewId);
        User currentUser = getCurrentUser();

        // Check if user owns this review
        if (!existingReview.getUser().getId().equals(currentUser.getId())) {
            throw new BadRequestException("You can only update your own reviews");
        }

        // Update fields
        if (reviewUpdate.getRating() != null) {
            if (reviewUpdate.getRating() < 1 || reviewUpdate.getRating() > 5) {
                throw new BadRequestException("Rating must be between 1 and 5");
            }
            existingReview.setRating(reviewUpdate.getRating());
        }
        if (reviewUpdate.getTitle() != null) {
            existingReview.setTitle(reviewUpdate.getTitle());
        }
        if (reviewUpdate.getContent() != null) {
            existingReview.setContent(reviewUpdate.getContent());
        }

        CourseReview savedReview = reviewRepository.save(existingReview);

        // Update course rating statistics
        updateCourseRatingStats(existingReview.getCourse());

        log.info("Review updated for course {} by user {}", 
                existingReview.getCourse().getTitle(), currentUser.getEmail());

        return savedReview;
    }

    public void deleteReview(String reviewId) {
        CourseReview review = getReviewById(reviewId);
        User currentUser = getCurrentUser();

        // Check permissions
        if (!currentUser.isAdmin() && !review.getUser().getId().equals(currentUser.getId())) {
            throw new BadRequestException("You can only delete your own reviews");
        }

        Course course = review.getCourse();
        reviewRepository.delete(review);

        // Update course rating statistics
        updateCourseRatingStats(course);

        log.info("Review deleted for course {} by user {}", course.getTitle(), currentUser.getEmail());
    }

    @Transactional(readOnly = true)
    public CourseReview getReviewById(String reviewId) {
        return reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));
    }

    @Transactional(readOnly = true)
    public Page<CourseReview> getCourseReviews(String courseId, Pageable pageable) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        return reviewRepository.findByCourseAndIsPublishedTrueOrderByCreatedAtDesc(course, pageable);
    }

    @Transactional(readOnly = true)
    public Page<CourseReview> getCourseReviewsByRating(String courseId, Integer rating, Pageable pageable) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        return reviewRepository.findByCourseAndRatingAndIsPublishedTrueOrderByCreatedAtDesc(course, rating, pageable);
    }

    @Transactional(readOnly = true)
    public Page<CourseReview> getCourseReviewsWithContent(String courseId, Pageable pageable) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        return reviewRepository.findReviewsWithContent(course, pageable);
    }

    @Transactional(readOnly = true)
    public Page<CourseReview> getUserReviews(Pageable pageable) {
        User currentUser = getCurrentUser();
        return reviewRepository.findByUserOrderByCreatedAtDesc(currentUser, pageable);
    }

    @Transactional(readOnly = true)
    public CourseReview getUserReviewForCourse(String courseId) {
        User currentUser = getCurrentUser();
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        return reviewRepository.findByUserAndCourse(currentUser, course)
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public List<Object[]> getCourseRatingDistribution(String courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        return reviewRepository.getRatingDistribution(course);
    }

    @Transactional(readOnly = true)
    public Page<CourseReview> getInstructorReviews(Pageable pageable) {
        User currentUser = getCurrentUser();
        
        if (!currentUser.isInstructor() && !currentUser.isAdmin()) {
            throw new BadRequestException("Only instructors can view their course reviews");
        }

        return reviewRepository.findByInstructor(currentUser, pageable);
    }

    @Transactional(readOnly = true)
    public Double getInstructorAverageRating() {
        User currentUser = getCurrentUser();
        
        if (!currentUser.isInstructor() && !currentUser.isAdmin()) {
            throw new BadRequestException("Only instructors can view their average rating");
        }

        return reviewRepository.getInstructorAverageRating(currentUser);
    }

    @Transactional(readOnly = true)
    public Page<CourseReview> getTopRatedReviews(String courseId, Pageable pageable) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        return reviewRepository.findTopRatedReviews(course, pageable);
    }

    public CourseReview moderateReview(String reviewId, boolean publish) {
        User currentUser = getCurrentUser();
        
        if (!currentUser.isAdmin()) {
            throw new BadRequestException("Only admins can moderate reviews");
        }

        CourseReview review = getReviewById(reviewId);
        review.setPublished(publish);
        
        CourseReview savedReview = reviewRepository.save(review);
        
        // Update course rating statistics
        updateCourseRatingStats(review.getCourse());

        log.info("Review {} for course {} by admin {}", 
                publish ? "published" : "unpublished", 
                review.getCourse().getTitle(), 
                currentUser.getEmail());

        return savedReview;
    }

    @Transactional(readOnly = true)
    public Page<CourseReview> getReviewsPendingModeration(Pageable pageable) {
        User currentUser = getCurrentUser();
        
        if (!currentUser.isAdmin()) {
            throw new BadRequestException("Only admins can view reviews pending moderation");
        }

        return reviewRepository.findByIsPublishedFalseOrderByCreatedAtDesc(pageable);
    }

    private void updateCourseRatingStats(Course course) {
        Double averageRating = reviewRepository.getAverageRating(course);
        long totalRatings = reviewRepository.countByCourseAndIsPublishedTrue(course);

        course.setAverageRating(averageRating != null ? 
                BigDecimal.valueOf(averageRating).setScale(2, RoundingMode.HALF_UP) : 
                BigDecimal.ZERO);
        course.setTotalRatings((int) totalRatings);

        courseRepository.save(course);
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
