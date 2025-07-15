package com.lms.repository;

import com.lms.entity.Assignment;
import com.lms.entity.AssignmentSubmission;
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
public interface AssignmentSubmissionRepository extends JpaRepository<AssignmentSubmission, String> {
    
    // Find submissions by assignment
    Page<AssignmentSubmission> findByAssignment(Assignment assignment, Pageable pageable);
    
    List<AssignmentSubmission> findByAssignmentOrderBySubmittedAtDesc(Assignment assignment);
    
    // Find submissions by student
    Page<AssignmentSubmission> findByStudent(User student, Pageable pageable);
    
    List<AssignmentSubmission> findByStudentOrderBySubmittedAtDesc(User student);
    
    // Find specific submission
    Optional<AssignmentSubmission> findByAssignmentAndStudentAndAttemptNumber(Assignment assignment, User student, Integer attemptNumber);
    
    Optional<AssignmentSubmission> findByAssignmentAndStudent(Assignment assignment, User student);
    
    // Find latest submission for student
    @Query("SELECT s FROM AssignmentSubmission s WHERE s.assignment = :assignment AND s.student = :student ORDER BY s.attemptNumber DESC")
    Optional<AssignmentSubmission> findLatestSubmission(@Param("assignment") Assignment assignment, @Param("student") User student);
    
    // Find submissions by status
    Page<AssignmentSubmission> findByAssignmentAndStatus(Assignment assignment, AssignmentSubmission.SubmissionStatus status, Pageable pageable);
    
    List<AssignmentSubmission> findByAssignmentAndStatusOrderBySubmittedAtAsc(Assignment assignment, AssignmentSubmission.SubmissionStatus status);
    
    // Find submissions requiring grading
    @Query("SELECT s FROM AssignmentSubmission s " +
           "LEFT JOIN s.grade g " +
           "WHERE s.assignment = :assignment AND s.status = 'SUBMITTED' AND g.id IS NULL")
    List<AssignmentSubmission> findSubmissionsRequiringGrading(@Param("assignment") Assignment assignment);
    
    // Find late submissions
    List<AssignmentSubmission> findByAssignmentAndIsLateTrue(Assignment assignment);
    
    // Count submissions
    long countByAssignment(Assignment assignment);
    
    long countByAssignmentAndStatus(Assignment assignment, AssignmentSubmission.SubmissionStatus status);
    
    long countByStudent(User student);
    
    // Find submissions by course (through assignment)
    @Query("SELECT s FROM AssignmentSubmission s WHERE s.assignment.course.id = :courseId")
    Page<AssignmentSubmission> findByCourseId(@Param("courseId") String courseId, Pageable pageable);
    
    // Find submissions within date range
    @Query("SELECT s FROM AssignmentSubmission s WHERE s.assignment = :assignment AND s.submittedAt BETWEEN :startDate AND :endDate")
    List<AssignmentSubmission> findByAssignmentAndSubmittedAtBetween(@Param("assignment") Assignment assignment, 
                                                                    @Param("startDate") LocalDateTime startDate, 
                                                                    @Param("endDate") LocalDateTime endDate);
    
    // Check if student has submitted
    boolean existsByAssignmentAndStudent(Assignment assignment, User student);
    
    // Get submission count for student in assignment
    int countByAssignmentAndStudent(Assignment assignment, User student);
}
