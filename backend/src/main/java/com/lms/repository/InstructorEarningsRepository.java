package com.lms.repository;

import com.lms.entity.Course;
import com.lms.entity.InstructorEarnings;
import com.lms.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface InstructorEarningsRepository extends JpaRepository<InstructorEarnings, String> {
    
    // Find earnings by instructor
    Page<InstructorEarnings> findByInstructorOrderByEarnedAtDesc(User instructor, Pageable pageable);
    
    // Find earnings by course
    Page<InstructorEarnings> findByCourseOrderByEarnedAtDesc(Course course, Pageable pageable);
    
    // Find earnings by status
    Page<InstructorEarnings> findByStatusOrderByEarnedAtDesc(InstructorEarnings.Status status, Pageable pageable);
    
    // Find earnings by instructor and status
    Page<InstructorEarnings> findByInstructorAndStatusOrderByEarnedAtDesc(User instructor, InstructorEarnings.Status status, Pageable pageable);
    
    // Get total earnings by instructor
    @Query("SELECT SUM(e.netAmount) FROM InstructorEarnings e WHERE e.instructor = :instructor")
    BigDecimal getTotalEarningsByInstructor(@Param("instructor") User instructor);
    
    // Get paid earnings by instructor
    @Query("SELECT SUM(e.netAmount) FROM InstructorEarnings e WHERE e.instructor = :instructor AND e.status = 'PAID'")
    BigDecimal getPaidEarningsByInstructor(@Param("instructor") User instructor);
    
    // Get pending earnings by instructor
    @Query("SELECT SUM(e.netAmount) FROM InstructorEarnings e WHERE e.instructor = :instructor AND e.status = 'PENDING'")
    BigDecimal getPendingEarningsByInstructor(@Param("instructor") User instructor);
    
    // Get earnings by course
    @Query("SELECT SUM(e.netAmount) FROM InstructorEarnings e WHERE e.course = :course")
    BigDecimal getTotalEarningsByCourse(@Param("course") Course course);
    
    // Get monthly earnings for instructor
    @Query("SELECT YEAR(e.earnedAt), MONTH(e.earnedAt), SUM(e.netAmount) FROM InstructorEarnings e WHERE e.instructor = :instructor GROUP BY YEAR(e.earnedAt), MONTH(e.earnedAt) ORDER BY YEAR(e.earnedAt) DESC, MONTH(e.earnedAt) DESC")
    List<Object[]> getMonthlyEarnings(@Param("instructor") User instructor);
    
    // Get earnings in date range
    @Query("SELECT e FROM InstructorEarnings e WHERE e.instructor = :instructor AND e.earnedAt BETWEEN :startDate AND :endDate ORDER BY e.earnedAt DESC")
    Page<InstructorEarnings> findByInstructorAndDateRange(@Param("instructor") User instructor, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate, Pageable pageable);
    
    // Get top earning instructors
    @Query("SELECT e.instructor, SUM(e.netAmount) as totalEarnings FROM InstructorEarnings e WHERE e.status = 'PAID' GROUP BY e.instructor ORDER BY totalEarnings DESC")
    Page<Object[]> getTopEarningInstructors(Pageable pageable);
    
    // Get top earning courses
    @Query("SELECT e.course, SUM(e.netAmount) as totalEarnings FROM InstructorEarnings e GROUP BY e.course ORDER BY totalEarnings DESC")
    Page<Object[]> getTopEarningCourses(Pageable pageable);
    
    // Count earnings by status
    long countByStatus(InstructorEarnings.Status status);
    
    // Find earnings pending payment
    List<InstructorEarnings> findByStatusOrderByEarnedAtAsc(InstructorEarnings.Status status);
}
