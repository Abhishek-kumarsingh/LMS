package com.lms.repository;

import com.lms.entity.Course;
import com.lms.entity.CourseReview;
import com.lms.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseReviewRepository extends JpaRepository<CourseReview, String> {
    
    // Find review by user and course
    Optional<CourseReview> findByUserAndCourse(User user, Course course);
    
    // Check if user has reviewed course
    boolean existsByUserAndCourse(User user, Course course);
    
    // Find reviews by course
    Page<CourseReview> findByCourseAndIsPublishedTrueOrderByCreatedAtDesc(Course course, Pageable pageable);
    
    // Find reviews by user
    Page<CourseReview> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);
    
    // Find reviews by rating
    Page<CourseReview> findByCourseAndRatingAndIsPublishedTrueOrderByCreatedAtDesc(Course course, Integer rating, Pageable pageable);
    
    // Find reviews with content (not just ratings)
    @Query("SELECT r FROM CourseReview r WHERE r.course = :course AND r.isPublished = true AND r.content IS NOT NULL AND LENGTH(r.content) > 0 ORDER BY r.createdAt DESC")
    Page<CourseReview> findReviewsWithContent(@Param("course") Course course, Pageable pageable);
    
    // Get rating distribution for course
    @Query("SELECT r.rating, COUNT(r) FROM CourseReview r WHERE r.course = :course AND r.isPublished = true GROUP BY r.rating ORDER BY r.rating DESC")
    List<Object[]> getRatingDistribution(@Param("course") Course course);
    
    // Get average rating for course
    @Query("SELECT AVG(r.rating) FROM CourseReview r WHERE r.course = :course AND r.isPublished = true")
    Double getAverageRating(@Param("course") Course course);
    
    // Count reviews by course
    long countByCourseAndIsPublishedTrue(Course course);
    
    // Count reviews by rating for course
    long countByCourseAndRatingAndIsPublishedTrue(Course course, Integer rating);
    
    // Find recent reviews
    Page<CourseReview> findByIsPublishedTrueOrderByCreatedAtDesc(Pageable pageable);
    
    // Find reviews for instructor's courses
    @Query("SELECT r FROM CourseReview r WHERE r.course.instructor = :instructor AND r.isPublished = true ORDER BY r.createdAt DESC")
    Page<CourseReview> findByInstructor(@Param("instructor") User instructor, Pageable pageable);
    
    // Get instructor's average rating across all courses
    @Query("SELECT AVG(r.rating) FROM CourseReview r WHERE r.course.instructor = :instructor AND r.isPublished = true")
    Double getInstructorAverageRating(@Param("instructor") User instructor);
    
    // Find top-rated reviews (helpful for featuring)
    @Query("SELECT r FROM CourseReview r WHERE r.course = :course AND r.isPublished = true AND r.rating >= 4 AND r.content IS NOT NULL ORDER BY r.rating DESC, r.createdAt DESC")
    Page<CourseReview> findTopRatedReviews(@Param("course") Course course, Pageable pageable);
    
    // Find reviews pending moderation
    Page<CourseReview> findByIsPublishedFalseOrderByCreatedAtDesc(Pageable pageable);
}
