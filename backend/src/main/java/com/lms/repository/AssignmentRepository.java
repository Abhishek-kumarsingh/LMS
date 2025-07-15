package com.lms.repository;

import com.lms.entity.Assignment;
import com.lms.entity.Course;
import com.lms.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, String> {
    
    // Find assignments by course
    Page<Assignment> findByCourseAndIsPublishedTrue(Course course, Pageable pageable);
    
    Page<Assignment> findByCourse(Course course, Pageable pageable);
    
    List<Assignment> findByCourseAndIsPublishedTrueOrderByDueDateAsc(Course course);
    
    // Find assignments by creator
    Page<Assignment> findByCreatedBy(User createdBy, Pageable pageable);
    
    List<Assignment> findByCreatedByOrderByCreatedAtDesc(User createdBy);
    
    // Find assignments by type
    Page<Assignment> findByCourseAndAssignmentType(Course course, Assignment.AssignmentType assignmentType, Pageable pageable);
    
    // Find assignments with upcoming due dates
    @Query("SELECT a FROM Assignment a WHERE a.course = :course AND a.isPublished = true AND a.dueDate BETWEEN :startDate AND :endDate ORDER BY a.dueDate ASC")
    List<Assignment> findUpcomingAssignments(@Param("course") Course course, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    // Find overdue assignments
    @Query("SELECT a FROM Assignment a WHERE a.course = :course AND a.isPublished = true AND a.dueDate < :currentDate ORDER BY a.dueDate DESC")
    List<Assignment> findOverdueAssignments(@Param("course") Course course, @Param("currentDate") LocalDateTime currentDate);
    
    // Find assignments available for submission
    @Query("SELECT a FROM Assignment a WHERE a.course = :course AND a.isPublished = true AND " +
           "(a.availableFrom IS NULL OR a.availableFrom <= :currentDate) AND " +
           "(a.availableUntil IS NULL OR a.availableUntil >= :currentDate)")
    List<Assignment> findAvailableAssignments(@Param("course") Course course, @Param("currentDate") LocalDateTime currentDate);
    
    // Find assignments by gradebook category
    @Query("SELECT a FROM Assignment a WHERE a.gradebookCategory.id = :categoryId ORDER BY a.dueDate ASC")
    List<Assignment> findByGradebookCategoryId(@Param("categoryId") String categoryId);
    
    // Count assignments by course
    long countByCourse(Course course);
    
    long countByCourseAndIsPublishedTrue(Course course);
    
    // Find assignments requiring grading
    @Query("SELECT DISTINCT a FROM Assignment a " +
           "JOIN a.submissions s " +
           "LEFT JOIN s.grade g " +
           "WHERE a.course = :course AND s.status = 'SUBMITTED' AND g.id IS NULL")
    List<Assignment> findAssignmentsRequiringGrading(@Param("course") Course course);
    
    // Search assignments
    @Query("SELECT a FROM Assignment a WHERE a.course = :course AND " +
           "(LOWER(a.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(a.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    Page<Assignment> searchAssignments(@Param("course") Course course, @Param("searchTerm") String searchTerm, Pageable pageable);
}
