package com.lms.repository;

import com.lms.entity.Course;
import com.lms.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface CourseRepository extends JpaRepository<Course, String> {
    
    // Find published courses
    Page<Course> findByIsPublishedTrueOrderByCreatedAtDesc(Pageable pageable);
    
    // Find courses by instructor
    Page<Course> findByInstructorOrderByCreatedAtDesc(User instructor, Pageable pageable);
    
    // Find courses by category
    @Query("SELECT c FROM Course c WHERE c.category.id = :categoryId AND c.isPublished = true ORDER BY c.createdAt DESC")
    Page<Course> findByCategoryIdAndPublished(@Param("categoryId") String categoryId, Pageable pageable);
    
    // Find courses by level
    Page<Course> findByLevelAndIsPublishedTrueOrderByCreatedAtDesc(Course.Level level, Pageable pageable);
    
    // Find featured courses
    Page<Course> findByIsFeaturedTrueAndIsPublishedTrueOrderByCreatedAtDesc(Pageable pageable);
    
    // Search courses by title or description
    @Query("SELECT c FROM Course c WHERE c.isPublished = true AND " +
           "(LOWER(c.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(c.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "ORDER BY c.createdAt DESC")
    Page<Course> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);
    
    // Find courses by price range
    @Query("SELECT c FROM Course c WHERE c.isPublished = true AND c.price BETWEEN :minPrice AND :maxPrice ORDER BY c.price ASC")
    Page<Course> findByPriceRange(@Param("minPrice") BigDecimal minPrice, @Param("maxPrice") BigDecimal maxPrice, Pageable pageable);
    
    // Find top rated courses
    @Query("SELECT c FROM Course c WHERE c.isPublished = true AND c.totalRatings > 0 ORDER BY c.averageRating DESC, c.totalRatings DESC")
    Page<Course> findTopRatedCourses(Pageable pageable);
    
    // Find most enrolled courses
    @Query("SELECT c FROM Course c WHERE c.isPublished = true ORDER BY c.enrolledCount DESC")
    Page<Course> findMostEnrolledCourses(Pageable pageable);
    
    // Find courses by instructor and status
    Page<Course> findByInstructorAndIsPublished(User instructor, boolean isPublished, Pageable pageable);
    
    // Count courses by instructor
    long countByInstructor(User instructor);
    
    // Count published courses by instructor
    long countByInstructorAndIsPublished(User instructor, boolean isPublished);
    
    // Find courses for admin review (unpublished)
    Page<Course> findByIsPublishedFalseOrderByCreatedAtDesc(Pageable pageable);
    
    // Advanced search with multiple filters
    @Query("SELECT c FROM Course c WHERE c.isPublished = true " +
           "AND (:categoryId IS NULL OR c.category.id = :categoryId) " +
           "AND (:level IS NULL OR c.level = :level) " +
           "AND (:minPrice IS NULL OR c.price >= :minPrice) " +
           "AND (:maxPrice IS NULL OR c.price <= :maxPrice) " +
           "AND (:keyword IS NULL OR LOWER(c.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(c.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "ORDER BY " +
           "CASE WHEN :sortBy = 'price' THEN c.price END ASC, " +
           "CASE WHEN :sortBy = 'rating' THEN c.averageRating END DESC, " +
           "CASE WHEN :sortBy = 'enrolled' THEN c.enrolledCount END DESC, " +
           "c.createdAt DESC")
    Page<Course> findWithFilters(@Param("categoryId") String categoryId,
                                @Param("level") Course.Level level,
                                @Param("minPrice") BigDecimal minPrice,
                                @Param("maxPrice") BigDecimal maxPrice,
                                @Param("keyword") String keyword,
                                @Param("sortBy") String sortBy,
                                Pageable pageable);
}
