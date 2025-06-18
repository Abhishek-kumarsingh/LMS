package com.lms.repository;

import com.lms.entity.Course;
import com.lms.entity.Enrollment;
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
public interface EnrollmentRepository extends JpaRepository<Enrollment, String> {
    
    // Find enrollment by user and course
    Optional<Enrollment> findByUserAndCourse(User user, Course course);
    
    // Check if user is enrolled in course
    boolean existsByUserAndCourse(User user, Course course);
    
    // Find all enrollments by user
    Page<Enrollment> findByUserOrderByEnrolledAtDesc(User user, Pageable pageable);
    
    // Find active enrollments by user
    Page<Enrollment> findByUserAndIsActiveTrueOrderByEnrolledAtDesc(User user, Pageable pageable);
    
    // Find completed enrollments by user
    Page<Enrollment> findByUserAndCompletedAtIsNotNullOrderByCompletedAtDesc(User user, Pageable pageable);
    
    // Find in-progress enrollments by user
    @Query("SELECT e FROM Enrollment e WHERE e.user = :user AND e.completedAt IS NULL AND e.isActive = true ORDER BY e.lastAccessedAt DESC")
    Page<Enrollment> findInProgressByUser(@Param("user") User user, Pageable pageable);
    
    // Find enrollments by course
    Page<Enrollment> findByCourseOrderByEnrolledAtDesc(Course course, Pageable pageable);
    
    // Find enrollments by instructor (through course)
    @Query("SELECT e FROM Enrollment e WHERE e.course.instructor = :instructor ORDER BY e.enrolledAt DESC")
    Page<Enrollment> findByInstructor(@Param("instructor") User instructor, Pageable pageable);
    
    // Count enrollments by course
    long countByCourse(Course course);
    
    // Count active enrollments by course
    long countByCourseAndIsActiveTrue(Course course);
    
    // Count completed enrollments by course
    long countByCourseAndCompletedAtIsNotNull(Course course);
    
    // Count enrollments by user
    long countByUser(User user);
    
    // Count completed enrollments by user
    long countByUserAndCompletedAtIsNotNull(User user);

    // Count all completed enrollments
    long countByCompletedAtIsNotNull();

    // Find recent enrollments
    Page<Enrollment> findByEnrolledAtAfterOrderByEnrolledAtDesc(LocalDateTime since, Pageable pageable);
    
    // Find enrollments with low progress
    @Query("SELECT e FROM Enrollment e WHERE e.progressPercentage < :threshold AND e.isActive = true AND e.completedAt IS NULL ORDER BY e.enrolledAt DESC")
    Page<Enrollment> findWithLowProgress(@Param("threshold") Double threshold, Pageable pageable);
    
    // Find enrollments that haven't been accessed recently
    @Query("SELECT e FROM Enrollment e WHERE e.lastAccessedAt < :threshold AND e.isActive = true AND e.completedAt IS NULL ORDER BY e.lastAccessedAt ASC")
    Page<Enrollment> findInactiveEnrollments(@Param("threshold") LocalDateTime threshold, Pageable pageable);
    
    // Get enrollment statistics for instructor
    @Query("SELECT COUNT(e), AVG(e.progressPercentage), " +
           "COUNT(CASE WHEN e.completedAt IS NOT NULL THEN 1 END) " +
           "FROM Enrollment e WHERE e.course.instructor = :instructor")
    Object[] getInstructorEnrollmentStats(@Param("instructor") User instructor);
    
    // Get monthly enrollment counts for course
    @Query("SELECT YEAR(e.enrolledAt), MONTH(e.enrolledAt), COUNT(e) " +
           "FROM Enrollment e WHERE e.course = :course " +
           "GROUP BY YEAR(e.enrolledAt), MONTH(e.enrolledAt) " +
           "ORDER BY YEAR(e.enrolledAt) DESC, MONTH(e.enrolledAt) DESC")
    List<Object[]> getMonthlyEnrollmentStats(@Param("course") Course course);

    // Additional methods for admin analytics
    long countByIsActiveTrue();
    long countByIsActiveFalse();
    long countByEnrolledAtAfter(LocalDateTime date);

    // Get monthly enrollment trends
    @Query("SELECT YEAR(e.enrolledAt), MONTH(e.enrolledAt), COUNT(e) FROM Enrollment e GROUP BY YEAR(e.enrolledAt), MONTH(e.enrolledAt) ORDER BY YEAR(e.enrolledAt) DESC, MONTH(e.enrolledAt) DESC")
    List<Object[]> getMonthlyEnrollmentTrends();

    // Get average progress across all enrollments
    @Query("SELECT AVG(e.progressPercentage) FROM Enrollment e WHERE e.isActive = true")
    Double getAverageProgress();
}
