package com.lms.repository;

import com.lms.entity.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, String> {
    
    // Find category by name
    Optional<Category> findByName(String name);
    
    // Find active categories
    List<Category> findByIsActiveTrueOrderByName();
    
    // Find active categories with pagination
    Page<Category> findByIsActiveTrueOrderByName(Pageable pageable);
    
    // Check if category name exists
    boolean existsByName(String name);
    
    // Search categories by name
    @Query("SELECT c FROM Category c WHERE c.isActive = true AND LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%')) ORDER BY c.name")
    List<Category> searchByName(@Param("keyword") String keyword);
    
    // Get categories with course count
    @Query("SELECT c, COUNT(course) FROM Category c LEFT JOIN c.courses course WHERE c.isActive = true GROUP BY c ORDER BY c.name")
    List<Object[]> getCategoriesWithCourseCount();
    
    // Find categories with published courses
    @Query("SELECT DISTINCT c FROM Category c JOIN c.courses course WHERE c.isActive = true AND course.isPublished = true ORDER BY c.name")
    List<Category> getCategoriesWithPublishedCourses();
}
