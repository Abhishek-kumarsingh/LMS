package com.lms.repository;

import com.lms.entity.Assignment;
import com.lms.entity.AssignmentGrade;
import com.lms.entity.AssignmentSubmission;
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
public interface AssignmentGradeRepository extends JpaRepository<AssignmentGrade, String> {
    
    // Find grade by submission
    Optional<AssignmentGrade> findBySubmission(AssignmentSubmission submission);
    
    // Find grades by assignment
    Page<AssignmentGrade> findByAssignment(Assignment assignment, Pageable pageable);
    
    List<AssignmentGrade> findByAssignmentOrderByPercentageDesc(Assignment assignment);
    
    // Find grades by student
    Page<AssignmentGrade> findByStudent(User student, Pageable pageable);
    
    List<AssignmentGrade> findByStudentOrderByGradedAtDesc(User student);
    
    // Find grades by grader
    Page<AssignmentGrade> findByGrader(User grader, Pageable pageable);
    
    // Find grades by status
    List<AssignmentGrade> findByAssignmentAndGradeStatus(Assignment assignment, AssignmentGrade.GradeStatus status);
    
    // Find released grades
    List<AssignmentGrade> findByAssignmentAndIsReleasedTrue(Assignment assignment);
    
    List<AssignmentGrade> findByStudentAndIsReleasedTrueOrderByGradedAtDesc(User student);
    
    // Find grades by course (through assignment)
    @Query("SELECT g FROM AssignmentGrade g WHERE g.assignment.course.id = :courseId")
    Page<AssignmentGrade> findByCourseId(@Param("courseId") String courseId, Pageable pageable);
    
    // Calculate average grade for assignment
    @Query("SELECT AVG(g.percentage) FROM AssignmentGrade g WHERE g.assignment = :assignment AND g.isExcused = false")
    Optional<BigDecimal> findAverageGradeByAssignment(@Param("assignment") Assignment assignment);
    
    // Calculate average grade for student in course
    @Query("SELECT AVG(g.percentage) FROM AssignmentGrade g WHERE g.student = :student AND g.assignment.course.id = :courseId AND g.isExcused = false")
    Optional<BigDecimal> findAverageGradeByStudentAndCourse(@Param("student") User student, @Param("courseId") String courseId);
    
    // Find highest and lowest grades
    @Query("SELECT MAX(g.percentage) FROM AssignmentGrade g WHERE g.assignment = :assignment AND g.isExcused = false")
    Optional<BigDecimal> findHighestGradeByAssignment(@Param("assignment") Assignment assignment);
    
    @Query("SELECT MIN(g.percentage) FROM AssignmentGrade g WHERE g.assignment = :assignment AND g.isExcused = false")
    Optional<BigDecimal> findLowestGradeByAssignment(@Param("assignment") Assignment assignment);
    
    // Count grades
    long countByAssignment(Assignment assignment);
    
    long countByAssignmentAndGradeStatus(Assignment assignment, AssignmentGrade.GradeStatus status);
    
    long countByStudent(User student);
    
    // Find grades needing review
    List<AssignmentGrade> findByGradeStatus(AssignmentGrade.GradeStatus status);
    
    // Find late submissions with penalties
    List<AssignmentGrade> findByAssignmentAndIsLateTrue(Assignment assignment);
    
    // Check if grade exists for submission
    boolean existsBySubmission(AssignmentSubmission submission);
}
