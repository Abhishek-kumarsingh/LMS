package com.lms.controller;

import com.lms.entity.CourseComment;
import com.lms.service.CourseCommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class CourseCommentController {

    private final CourseCommentService commentService;

    @PostMapping("/courses/{courseId}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<CourseComment> createComment(@PathVariable String courseId,
                                                     @Valid @RequestBody CourseComment comment) {
        CourseComment createdComment = commentService.createComment(courseId, comment);
        return ResponseEntity.ok(createdComment);
    }

    @PostMapping("/{commentId}/replies")
    @PreAuthorize("hasRole('STUDENT') or hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<CourseComment> createReply(@PathVariable String commentId,
                                                   @Valid @RequestBody CourseComment reply) {
        CourseComment createdReply = commentService.createReply(commentId, reply);
        return ResponseEntity.ok(createdReply);
    }

    @PutMapping("/{commentId}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<CourseComment> updateComment(@PathVariable String commentId,
                                                     @Valid @RequestBody CourseComment comment) {
        CourseComment updatedComment = commentService.updateComment(commentId, comment);
        return ResponseEntity.ok(updatedComment);
    }

    @DeleteMapping("/{commentId}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Void> deleteComment(@PathVariable String commentId) {
        commentService.deleteComment(commentId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{commentId}")
    public ResponseEntity<CourseComment> getComment(@PathVariable String commentId) {
        CourseComment comment = commentService.getCommentById(commentId);
        return ResponseEntity.ok(comment);
    }

    @GetMapping("/courses/{courseId}")
    public ResponseEntity<Page<CourseComment>> getCourseComments(@PathVariable String courseId,
                                                               @PageableDefault(size = 10) Pageable pageable) {
        Page<CourseComment> comments = commentService.getCourseComments(courseId, pageable);
        return ResponseEntity.ok(comments);
    }

    @GetMapping("/courses/{courseId}/with-replies")
    public ResponseEntity<List<CourseComment>> getCourseCommentsWithReplies(@PathVariable String courseId) {
        List<CourseComment> comments = commentService.getCourseCommentsWithReplies(courseId);
        return ResponseEntity.ok(comments);
    }

    @GetMapping("/{commentId}/replies")
    public ResponseEntity<Page<CourseComment>> getCommentReplies(@PathVariable String commentId,
                                                               @PageableDefault(size = 10) Pageable pageable) {
        Page<CourseComment> replies = commentService.getCommentReplies(commentId, pageable);
        return ResponseEntity.ok(replies);
    }

    @GetMapping("/my-comments")
    @PreAuthorize("hasRole('STUDENT') or hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Page<CourseComment>> getUserComments(@PageableDefault(size = 10) Pageable pageable) {
        Page<CourseComment> comments = commentService.getUserComments(pageable);
        return ResponseEntity.ok(comments);
    }

    @GetMapping("/instructor/comments")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Page<CourseComment>> getInstructorComments(@PageableDefault(size = 10) Pageable pageable) {
        Page<CourseComment> comments = commentService.getInstructorComments(pageable);
        return ResponseEntity.ok(comments);
    }

    @GetMapping("/courses/{courseId}/count")
    public ResponseEntity<Long> getCourseCommentCount(@PathVariable String courseId) {
        long count = commentService.getCourseCommentCount(courseId);
        return ResponseEntity.ok(count);
    }

    @GetMapping("/{commentId}/replies/count")
    public ResponseEntity<Long> getCommentReplyCount(@PathVariable String commentId) {
        long count = commentService.getCommentReplyCount(commentId);
        return ResponseEntity.ok(count);
    }

    @GetMapping("/courses/{courseId}/stats")
    public ResponseEntity<Object[]> getCourseCommentStats(@PathVariable String courseId) {
        Object[] stats = commentService.getCourseCommentStats(courseId);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/search")
    public ResponseEntity<Page<CourseComment>> searchComments(@RequestParam String keyword,
                                                            @PageableDefault(size = 10) Pageable pageable) {
        Page<CourseComment> comments = commentService.searchComments(keyword, pageable);
        return ResponseEntity.ok(comments);
    }

    @PutMapping("/{commentId}/moderate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CourseComment> moderateComment(@PathVariable String commentId,
                                                       @RequestParam boolean publish) {
        CourseComment comment = commentService.moderateComment(commentId, publish);
        return ResponseEntity.ok(comment);
    }

    @GetMapping("/pending-moderation")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<CourseComment>> getCommentsPendingModeration(@PageableDefault(size = 10) Pageable pageable) {
        Page<CourseComment> comments = commentService.getCommentsPendingModeration(pageable);
        return ResponseEntity.ok(comments);
    }
}
