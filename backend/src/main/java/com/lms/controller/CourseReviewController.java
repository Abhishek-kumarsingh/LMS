package com.lms.controller;

import com.lms.entity.CourseReview;
import com.lms.service.CourseReviewService;
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
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class CourseReviewController {

    private final CourseReviewService reviewService;

    @PostMapping("/courses/{courseId}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<CourseReview> createReview(@PathVariable String courseId,
                                                   @Valid @RequestBody CourseReview review) {
        CourseReview createdReview = reviewService.createReview(courseId, review);
        return ResponseEntity.ok(createdReview);
    }

    @PutMapping("/{reviewId}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<CourseReview> updateReview(@PathVariable String reviewId,
                                                   @Valid @RequestBody CourseReview review) {
        CourseReview updatedReview = reviewService.updateReview(reviewId, review);
        return ResponseEntity.ok(updatedReview);
    }

    @DeleteMapping("/{reviewId}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Void> deleteReview(@PathVariable String reviewId) {
        reviewService.deleteReview(reviewId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{reviewId}")
    public ResponseEntity<CourseReview> getReview(@PathVariable String reviewId) {
        CourseReview review = reviewService.getReviewById(reviewId);
        return ResponseEntity.ok(review);
    }

    @GetMapping("/courses/{courseId}")
    public ResponseEntity<Page<CourseReview>> getCourseReviews(@PathVariable String courseId,
                                                             @PageableDefault(size = 10) Pageable pageable) {
        Page<CourseReview> reviews = reviewService.getCourseReviews(courseId, pageable);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/courses/{courseId}/rating/{rating}")
    public ResponseEntity<Page<CourseReview>> getCourseReviewsByRating(@PathVariable String courseId,
                                                                     @PathVariable Integer rating,
                                                                     @PageableDefault(size = 10) Pageable pageable) {
        Page<CourseReview> reviews = reviewService.getCourseReviewsByRating(courseId, rating, pageable);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/courses/{courseId}/with-content")
    public ResponseEntity<Page<CourseReview>> getCourseReviewsWithContent(@PathVariable String courseId,
                                                                        @PageableDefault(size = 10) Pageable pageable) {
        Page<CourseReview> reviews = reviewService.getCourseReviewsWithContent(courseId, pageable);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/courses/{courseId}/top-rated")
    public ResponseEntity<Page<CourseReview>> getTopRatedReviews(@PathVariable String courseId,
                                                               @PageableDefault(size = 5) Pageable pageable) {
        Page<CourseReview> reviews = reviewService.getTopRatedReviews(courseId, pageable);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/courses/{courseId}/rating-distribution")
    public ResponseEntity<List<Object[]>> getCourseRatingDistribution(@PathVariable String courseId) {
        List<Object[]> distribution = reviewService.getCourseRatingDistribution(courseId);
        return ResponseEntity.ok(distribution);
    }

    @GetMapping("/my-reviews")
    @PreAuthorize("hasRole('STUDENT') or hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Page<CourseReview>> getUserReviews(@PageableDefault(size = 10) Pageable pageable) {
        Page<CourseReview> reviews = reviewService.getUserReviews(pageable);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/courses/{courseId}/my-review")
    @PreAuthorize("hasRole('STUDENT') or hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<CourseReview> getUserReviewForCourse(@PathVariable String courseId) {
        CourseReview review = reviewService.getUserReviewForCourse(courseId);
        if (review != null) {
            return ResponseEntity.ok(review);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/instructor/reviews")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Page<CourseReview>> getInstructorReviews(@PageableDefault(size = 10) Pageable pageable) {
        Page<CourseReview> reviews = reviewService.getInstructorReviews(pageable);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/instructor/average-rating")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Double> getInstructorAverageRating() {
        Double averageRating = reviewService.getInstructorAverageRating();
        return ResponseEntity.ok(averageRating);
    }

    @PutMapping("/{reviewId}/moderate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CourseReview> moderateReview(@PathVariable String reviewId,
                                                     @RequestParam boolean publish) {
        CourseReview review = reviewService.moderateReview(reviewId, publish);
        return ResponseEntity.ok(review);
    }

    @GetMapping("/pending-moderation")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<CourseReview>> getReviewsPendingModeration(@PageableDefault(size = 10) Pageable pageable) {
        Page<CourseReview> reviews = reviewService.getReviewsPendingModeration(pageable);
        return ResponseEntity.ok(reviews);
    }
}
