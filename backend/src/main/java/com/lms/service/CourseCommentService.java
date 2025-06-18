package com.lms.service;

import com.lms.entity.Course;
import com.lms.entity.CourseComment;

import com.lms.entity.User;
import com.lms.exception.BadRequestException;
import com.lms.exception.ResourceNotFoundException;
import com.lms.repository.CourseCommentRepository;
import com.lms.repository.CourseRepository;
import com.lms.repository.EnrollmentRepository;
import com.lms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CourseCommentService {

    private final CourseCommentRepository commentRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;

    public CourseComment createComment(String courseId, CourseComment comment) {
        User currentUser = getCurrentUser();
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        // Check if user is enrolled in the course or is the instructor
        if (!enrollmentRepository.existsByUserAndCourse(currentUser, course) && 
            !course.getInstructor().getId().equals(currentUser.getId())) {
            throw new BadRequestException("You must be enrolled in the course to comment");
        }

        // Validate comment content
        if (comment.getContent() == null || comment.getContent().trim().isEmpty()) {
            throw new BadRequestException("Comment content cannot be empty");
        }

        // Set comment properties
        comment.setId(UUID.randomUUID().toString());
        comment.setUser(currentUser);
        comment.setCourse(course);
        comment.setPublished(true);

        CourseComment savedComment = commentRepository.save(comment);

        log.info("Comment created for course {} by user {}", course.getTitle(), currentUser.getEmail());

        return savedComment;
    }

    public CourseComment createReply(String parentCommentId, CourseComment reply) {
        User currentUser = getCurrentUser();
        CourseComment parentComment = getCommentById(parentCommentId);
        Course course = parentComment.getCourse();

        // Check if user is enrolled in the course or is the instructor
        if (!enrollmentRepository.existsByUserAndCourse(currentUser, course) && 
            !course.getInstructor().getId().equals(currentUser.getId())) {
            throw new BadRequestException("You must be enrolled in the course to reply");
        }

        // Validate reply content
        if (reply.getContent() == null || reply.getContent().trim().isEmpty()) {
            throw new BadRequestException("Reply content cannot be empty");
        }

        // Set reply properties
        reply.setId(UUID.randomUUID().toString());
        reply.setUser(currentUser);
        reply.setCourse(course);
        reply.setParentComment(parentComment);
        reply.setLesson(parentComment.getLesson()); // Inherit lesson from parent
        reply.setPublished(true);

        CourseComment savedReply = commentRepository.save(reply);

        log.info("Reply created for comment {} by user {}", parentCommentId, currentUser.getEmail());

        return savedReply;
    }

    public CourseComment updateComment(String commentId, CourseComment commentUpdate) {
        CourseComment existingComment = getCommentById(commentId);
        User currentUser = getCurrentUser();

        // Check if user owns this comment
        if (!existingComment.getUser().getId().equals(currentUser.getId())) {
            throw new BadRequestException("You can only update your own comments");
        }

        // Validate content
        if (commentUpdate.getContent() == null || commentUpdate.getContent().trim().isEmpty()) {
            throw new BadRequestException("Comment content cannot be empty");
        }

        existingComment.setContent(commentUpdate.getContent());
        CourseComment savedComment = commentRepository.save(existingComment);

        log.info("Comment updated for course {} by user {}", 
                existingComment.getCourse().getTitle(), currentUser.getEmail());

        return savedComment;
    }

    public void deleteComment(String commentId) {
        CourseComment comment = getCommentById(commentId);
        User currentUser = getCurrentUser();

        // Check permissions
        if (!currentUser.isAdmin() && 
            !comment.getUser().getId().equals(currentUser.getId()) &&
            !comment.getCourse().getInstructor().getId().equals(currentUser.getId())) {
            throw new BadRequestException("You can only delete your own comments or comments on your courses");
        }

        commentRepository.delete(comment);

        log.info("Comment deleted for course {} by user {}", 
                comment.getCourse().getTitle(), currentUser.getEmail());
    }

    @Transactional(readOnly = true)
    public CourseComment getCommentById(String commentId) {
        return commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));
    }

    @Transactional(readOnly = true)
    public Page<CourseComment> getCourseComments(String courseId, Pageable pageable) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        return commentRepository.findTopLevelCommentsByCourse(course, pageable);
    }

    @Transactional(readOnly = true)
    public Page<CourseComment> getCommentReplies(String commentId, Pageable pageable) {
        CourseComment parentComment = getCommentById(commentId);
        return commentRepository.findByParentCommentAndIsPublishedTrueOrderByCreatedAtAsc(parentComment, pageable);
    }

    @Transactional(readOnly = true)
    public List<CourseComment> getCourseCommentsWithReplies(String courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        return commentRepository.findCommentsWithRepliesByCourse(course);
    }

    @Transactional(readOnly = true)
    public Page<CourseComment> getUserComments(Pageable pageable) {
        User currentUser = getCurrentUser();
        return commentRepository.findByUserOrderByCreatedAtDesc(currentUser, pageable);
    }

    @Transactional(readOnly = true)
    public Page<CourseComment> getInstructorComments(Pageable pageable) {
        User currentUser = getCurrentUser();
        
        if (!currentUser.isInstructor() && !currentUser.isAdmin()) {
            throw new BadRequestException("Only instructors can view comments on their courses");
        }

        return commentRepository.findByInstructor(currentUser, pageable);
    }

    @Transactional(readOnly = true)
    public long getCourseCommentCount(String courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        return commentRepository.countByCourseAndIsPublishedTrue(course);
    }

    @Transactional(readOnly = true)
    public long getCommentReplyCount(String commentId) {
        CourseComment comment = getCommentById(commentId);
        return commentRepository.countByParentCommentAndIsPublishedTrue(comment);
    }

    @Transactional(readOnly = true)
    public Object[] getCourseCommentStats(String courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        return commentRepository.getCommentStats(course);
    }

    @Transactional(readOnly = true)
    public Page<CourseComment> searchComments(String keyword, Pageable pageable) {
        return commentRepository.searchByContent(keyword, pageable);
    }

    public CourseComment moderateComment(String commentId, boolean publish) {
        User currentUser = getCurrentUser();
        
        if (!currentUser.isAdmin()) {
            throw new BadRequestException("Only admins can moderate comments");
        }

        CourseComment comment = getCommentById(commentId);
        comment.setPublished(publish);
        
        CourseComment savedComment = commentRepository.save(comment);

        log.info("Comment {} for course {} by admin {}", 
                publish ? "published" : "unpublished", 
                comment.getCourse().getTitle(), 
                currentUser.getEmail());

        return savedComment;
    }

    @Transactional(readOnly = true)
    public Page<CourseComment> getCommentsPendingModeration(Pageable pageable) {
        User currentUser = getCurrentUser();
        
        if (!currentUser.isAdmin()) {
            throw new BadRequestException("Only admins can view comments pending moderation");
        }

        return commentRepository.findByIsPublishedFalseOrderByCreatedAtDesc(pageable);
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
