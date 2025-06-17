package com.lms.repository;

import com.lms.entity.Course;
import com.lms.entity.User;
import com.lms.entity.Wishlist;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WishlistRepository extends JpaRepository<Wishlist, String> {
    
    // Find wishlist item by user and course
    Optional<Wishlist> findByUserAndCourse(User user, Course course);
    
    // Check if course is in user's wishlist
    boolean existsByUserAndCourse(User user, Course course);
    
    // Find user's wishlist
    Page<Wishlist> findByUserOrderByAddedAtDesc(User user, Pageable pageable);
    
    // Find user's wishlist as list
    List<Wishlist> findByUserOrderByAddedAtDesc(User user);
    
    // Count items in user's wishlist
    long countByUser(User user);
    
    // Find wishlists containing a specific course
    Page<Wishlist> findByCourseOrderByAddedAtDesc(Course course, Pageable pageable);
    
    // Count how many users have added course to wishlist
    long countByCourse(Course course);
    
    // Find most wishlisted courses
    @Query("SELECT w.course, COUNT(w) as wishlistCount FROM Wishlist w GROUP BY w.course ORDER BY wishlistCount DESC")
    Page<Object[]> findMostWishlistedCourses(Pageable pageable);
    
    // Find wishlist items by category
    @Query("SELECT w FROM Wishlist w WHERE w.user = :user AND w.course.category.id = :categoryId ORDER BY w.addedAt DESC")
    Page<Wishlist> findByUserAndCategoryId(@Param("user") User user, @Param("categoryId") String categoryId, Pageable pageable);
    
    // Find wishlist items by price range
    @Query("SELECT w FROM Wishlist w WHERE w.user = :user AND w.course.price BETWEEN :minPrice AND :maxPrice ORDER BY w.addedAt DESC")
    Page<Wishlist> findByUserAndPriceRange(@Param("user") User user, @Param("minPrice") Double minPrice, @Param("maxPrice") Double maxPrice, Pageable pageable);
    
    // Delete wishlist item by user and course
    void deleteByUserAndCourse(User user, Course course);
    
    // Find recent wishlist additions
    Page<Wishlist> findByAddedAtAfterOrderByAddedAtDesc(java.time.LocalDateTime since, Pageable pageable);
}
