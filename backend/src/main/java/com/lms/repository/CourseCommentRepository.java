package com.lms.repository;

import com.lms.entity.Course;
import com.lms.entity.CourseComment;
import com.lms.entity.Lesson;
import com.lms.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseCommentRepository extends JpaRepository<CourseComment, String> {
    
    // Find comments by course (top-level comments only)
    @Query("SELECT c FROM CourseComment c WHERE c.course = :course AND c.parentComment IS NULL AND c.isPublished = true ORDER BY c.createdAt DESC")
    Page<CourseComment> findTopLevelCommentsByCourse(@Param("course") Course course, Pageable pageable);
    
    // Find comments by lesson (top-level comments only)
    @Query("SELECT c FROM CourseComment c WHERE c.lesson = :lesson AND c.parentComment IS NULL AND c.isPublished = true ORDER BY c.createdAt DESC")
    Page<CourseComment> findTopLevelCommentsByLesson(@Param("lesson") Lesson lesson, Pageable pageable);
    
    // Find replies to a comment
    Page<CourseComment> findByParentCommentAndIsPublishedTrueOrderByCreatedAtAsc(CourseComment parentComment, Pageable pageable);
    
    // Find all comments by course (including replies)
    Page<CourseComment> findByCourseAndIsPublishedTrueOrderByCreatedAtDesc(Course course, Pageable pageable);
    
    // Find comments by user
    Page<CourseComment> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);
    
    // Find comments by instructor's courses
    @Query("SELECT c FROM CourseComment c WHERE c.course.instructor = :instructor AND c.isPublished = true ORDER BY c.createdAt DESC")
    Page<CourseComment> findByInstructor(@Param("instructor") User instructor, Pageable pageable);
    
    // Count comments by course
    long countByCourseAndIsPublishedTrue(Course course);
    
    // Count comments by lesson
    long countByLessonAndIsPublishedTrue(Lesson lesson);
    
    // Count replies to a comment
    long countByParentCommentAndIsPublishedTrue(CourseComment parentComment);
    
    // Find recent comments
    Page<CourseComment> findByIsPublishedTrueOrderByCreatedAtDesc(Pageable pageable);
    
    // Find comments pending moderation
    Page<CourseComment> findByIsPublishedFalseOrderByCreatedAtDesc(Pageable pageable);
    
    // Find comments with replies (for nested loading)
    @Query("SELECT DISTINCT c FROM CourseComment c LEFT JOIN FETCH c.replies r WHERE c.course = :course AND c.parentComment IS NULL AND c.isPublished = true ORDER BY c.createdAt DESC")
    List<CourseComment> findCommentsWithRepliesByCourse(@Param("course") Course course);
    
    // Search comments by content
    @Query("SELECT c FROM CourseComment c WHERE c.isPublished = true AND LOWER(c.content) LIKE LOWER(CONCAT('%', :keyword, '%')) ORDER BY c.createdAt DESC")
    Page<CourseComment> searchByContent(@Param("keyword") String keyword, Pageable pageable);
    
    // Get comment statistics for course
    @Query("SELECT COUNT(c), COUNT(CASE WHEN c.parentComment IS NULL THEN 1 END), COUNT(CASE WHEN c.parentComment IS NOT NULL THEN 1 END) FROM CourseComment c WHERE c.course = :course AND c.isPublished = true")
    Object[] getCommentStats(@Param("course") Course course);
}
