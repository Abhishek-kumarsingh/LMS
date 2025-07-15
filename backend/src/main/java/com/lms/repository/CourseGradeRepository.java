package com.lms.repository;

import com.lms.entity.Course;
import com.lms.entity.CourseGrade;
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
public interface CourseGradeRepository extends JpaRepository<CourseGrade, String> {
    
    // Find course grade for specific student
    Optional<CourseGrade> findByCourseAndStudent(Course course, User student);
    
    // Find all grades for a course
    Page<CourseGrade> findByCourse(Course course, Pageable pageable);
    
    List<CourseGrade> findByCourseOrderByCurrentGradeDesc(Course course);
    
    // Find all grades for a student
    Page<CourseGrade> findByStudent(User student, Pageable pageable);
    
    List<CourseGrade> findByStudentOrderByUpdatedAtDesc(User student);
    
    // Find passing/failing students
    List<CourseGrade> findByCourseAndIsPassingTrue(Course course);
    
    List<CourseGrade> findByCourseAndIsPassingFalse(Course course);
    
    // Find completed courses
    List<CourseGrade> findByStudentAndIsCompleteTrue(User student);
    
    List<CourseGrade> findByCourseAndIsCompleteTrue(Course course);
    
    // Calculate statistics
    @Query("SELECT AVG(cg.currentGrade) FROM CourseGrade cg WHERE cg.course = :course AND cg.currentGrade IS NOT NULL")
    Optional<BigDecimal> findAverageGradeByCourse(@Param("course") Course course);
    
    @Query("SELECT MAX(cg.currentGrade) FROM CourseGrade cg WHERE cg.course = :course AND cg.currentGrade IS NOT NULL")
    Optional<BigDecimal> findHighestGradeByCourse(@Param("course") Course course);
    
    @Query("SELECT MIN(cg.currentGrade) FROM CourseGrade cg WHERE cg.course = :course AND cg.currentGrade IS NOT NULL")
    Optional<BigDecimal> findLowestGradeByCourse(@Param("course") Course course);
    
    // Count students by grade ranges
    @Query("SELECT COUNT(cg) FROM CourseGrade cg WHERE cg.course = :course AND cg.currentGrade >= :minGrade AND cg.currentGrade <= :maxGrade")
    long countByGradeRange(@Param("course") Course course, @Param("minGrade") BigDecimal minGrade, @Param("maxGrade") BigDecimal maxGrade);
    
    // Find students needing attention (low grades)
    @Query("SELECT cg FROM CourseGrade cg WHERE cg.course = :course AND cg.currentGrade < :threshold ORDER BY cg.currentGrade ASC")
    List<CourseGrade> findStudentsNeedingAttention(@Param("course") Course course, @Param("threshold") BigDecimal threshold);
    
    // Count totals
    long countByCourse(Course course);
    
    long countByStudent(User student);
    
    long countByCourseAndIsPassingTrue(Course course);
    
    long countByCourseAndIsCompleteTrue(Course course);
    
    // Check if grade exists
    boolean existsByCourseAndStudent(Course course, User student);
}
