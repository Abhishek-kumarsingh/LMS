package com.lms.repository;

import com.lms.entity.Course;
import com.lms.entity.GradebookCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface GradebookCategoryRepository extends JpaRepository<GradebookCategory, String> {
    
    // Find categories by course
    List<GradebookCategory> findByCourseOrderByCategoryOrderAsc(Course course);
    
    List<GradebookCategory> findByCourseAndIsActiveTrueOrderByCategoryOrderAsc(Course course);
    
    // Find category by name in course
    Optional<GradebookCategory> findByCourseAndName(Course course, String name);
    
    // Check if category name exists in course
    boolean existsByCourseAndName(Course course, String name);
    
    // Calculate total weight percentage for course
    @Query("SELECT SUM(gc.weightPercentage) FROM GradebookCategory gc WHERE gc.course = :course AND gc.isActive = true")
    Optional<BigDecimal> calculateTotalWeightPercentage(@Param("course") Course course);
    
    // Count categories
    long countByCourse(Course course);
    
    long countByCourseAndIsActiveTrue(Course course);
    
    // Find next order index
    @Query("SELECT COALESCE(MAX(gc.categoryOrder), 0) + 1 FROM GradebookCategory gc WHERE gc.course = :course")
    Integer findNextOrderIndex(@Param("course") Course course);
}
