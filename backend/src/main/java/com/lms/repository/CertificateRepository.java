package com.lms.repository;

import com.lms.entity.Certificate;
import com.lms.entity.Course;
import com.lms.entity.Enrollment;
import com.lms.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CertificateRepository extends JpaRepository<Certificate, String> {
    
    // Find certificate by enrollment
    Optional<Certificate> findByEnrollment(Enrollment enrollment);
    
    // Find certificate by user and course
    Optional<Certificate> findByUserAndCourse(User user, Course course);
    
    // Find certificate by certificate number
    Optional<Certificate> findByCertificateNumber(String certificateNumber);
    
    // Check if certificate exists for enrollment
    boolean existsByEnrollment(Enrollment enrollment);
    
    // Find certificates by user
    Page<Certificate> findByUserOrderByIssuedAtDesc(User user, Pageable pageable);
    
    // Find certificates by course
    Page<Certificate> findByCourseOrderByIssuedAtDesc(Course course, Pageable pageable);
    
    // Find certificates by instructor (through course)
    @Query("SELECT c FROM Certificate c WHERE c.course.instructor = :instructor ORDER BY c.issuedAt DESC")
    Page<Certificate> findByInstructor(@Param("instructor") User instructor, Pageable pageable);
    
    // Find certificates by status
    Page<Certificate> findByStatusOrderByIssuedAtDesc(Certificate.Status status, Pageable pageable);
    
    // Find generated certificates
    Page<Certificate> findByStatusAndFileUrlIsNotNullOrderByIssuedAtDesc(Certificate.Status status, Pageable pageable);
    
    // Count certificates by user
    long countByUser(User user);
    
    // Count certificates by course
    long countByCourse(Course course);
    
    // Count certificates by status
    long countByStatus(Certificate.Status status);
    
    // Find recent certificates
    Page<Certificate> findByIssuedAtAfterOrderByIssuedAtDesc(java.time.LocalDateTime since, Pageable pageable);
    
    // Find certificates pending generation
    List<Certificate> findByStatusOrderByIssuedAtAsc(Certificate.Status status);
    
    // Find most downloaded certificates
    @Query("SELECT c FROM Certificate c WHERE c.downloadCount > 0 ORDER BY c.downloadCount DESC, c.issuedAt DESC")
    Page<Certificate> findMostDownloadedCertificates(Pageable pageable);
    
    // Get certificate statistics for instructor
    @Query("SELECT COUNT(c), COUNT(CASE WHEN c.status = 'GENERATED' THEN 1 END), SUM(c.downloadCount) FROM Certificate c WHERE c.course.instructor = :instructor")
    Object[] getInstructorCertificateStats(@Param("instructor") User instructor);
    
    // Find certificates by course and status
    Page<Certificate> findByCourseAndStatusOrderByIssuedAtDesc(Course course, Certificate.Status status, Pageable pageable);
}
