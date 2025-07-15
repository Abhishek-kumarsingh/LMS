package com.lms.repository;

import com.lms.entity.Course;
import com.lms.entity.Rubric;
import com.lms.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RubricRepository extends JpaRepository<Rubric, String> {
    
    // Find rubrics by course
    Page<Rubric> findByCourse(Course course, Pageable pageable);
    
    List<Rubric> findByCourseOrderByCreatedAtDesc(Course course);
    
    List<Rubric> findByCourseAndIsPublishedTrue(Course course);
    
    // Find rubrics by creator
    Page<Rubric> findByCreatedBy(User createdBy, Pageable pageable);
    
    List<Rubric> findByCreatedByOrderByCreatedAtDesc(User createdBy);
    
    // Search rubrics
    @Query("SELECT r FROM Rubric r WHERE r.course = :course AND " +
           "(LOWER(r.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(r.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    Page<Rubric> searchRubrics(@Param("course") Course course, @Param("searchTerm") String searchTerm, Pageable pageable);
    
    // Count rubrics
    long countByCourse(Course course);
    
    long countByCourseAndIsPublishedTrue(Course course);
}
