package com.lms.controller;

import com.lms.entity.Course;
import com.lms.service.CourseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class CourseController {

    private final CourseService courseService;

    @PostMapping
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Course> createCourse(@Valid @RequestBody Course course) {
        Course createdCourse = courseService.createCourse(course);
        return ResponseEntity.ok(createdCourse);
    }

    @PutMapping("/{courseId}")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Course> updateCourse(@PathVariable String courseId, 
                                             @Valid @RequestBody Course course) {
        Course updatedCourse = courseService.updateCourse(courseId, course);
        return ResponseEntity.ok(updatedCourse);
    }

    @PostMapping("/{courseId}/thumbnail")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Course> uploadThumbnail(@PathVariable String courseId,
                                                @RequestParam("file") MultipartFile file) throws IOException {
        Course updatedCourse = courseService.uploadThumbnail(courseId, file);
        return ResponseEntity.ok(updatedCourse);
    }

    @PostMapping("/{courseId}/preview-video")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Course> uploadPreviewVideo(@PathVariable String courseId,
                                                   @RequestParam("file") MultipartFile file) throws IOException {
        Course updatedCourse = courseService.uploadPreviewVideo(courseId, file);
        return ResponseEntity.ok(updatedCourse);
    }

    @GetMapping("/{courseId}")
    public ResponseEntity<Course> getCourse(@PathVariable String courseId) {
        Course course = courseService.getCourseById(courseId);
        return ResponseEntity.ok(course);
    }

    @GetMapping
    public ResponseEntity<Page<Course>> getAllCourses(@PageableDefault(size = 12) Pageable pageable) {
        Page<Course> courses = courseService.getAllPublishedCourses(pageable);
        return ResponseEntity.ok(courses);
    }

    @GetMapping("/instructor/{instructorId}")
    public ResponseEntity<Page<Course>> getCoursesByInstructor(@PathVariable String instructorId,
                                                             @PageableDefault(size = 12) Pageable pageable) {
        Page<Course> courses = courseService.getCoursesByInstructor(instructorId, pageable);
        return ResponseEntity.ok(courses);
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<Page<Course>> getCoursesByCategory(@PathVariable String categoryId,
                                                           @PageableDefault(size = 12) Pageable pageable) {
        Page<Course> courses = courseService.getCoursesByCategory(categoryId, pageable);
        return ResponseEntity.ok(courses);
    }

    @GetMapping("/search")
    public ResponseEntity<Page<Course>> searchCourses(@RequestParam String keyword,
                                                    @PageableDefault(size = 12) Pageable pageable) {
        Page<Course> courses = courseService.searchCourses(keyword, pageable);
        return ResponseEntity.ok(courses);
    }

    @GetMapping("/filter")
    public ResponseEntity<Page<Course>> getCoursesWithFilters(
            @RequestParam(required = false) String categoryId,
            @RequestParam(required = false) Course.Level level,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "created") String sortBy,
            @PageableDefault(size = 12) Pageable pageable) {
        Page<Course> courses = courseService.getCoursesWithFilters(
                categoryId, level, minPrice, maxPrice, keyword, sortBy, pageable);
        return ResponseEntity.ok(courses);
    }

    @GetMapping("/featured")
    public ResponseEntity<Page<Course>> getFeaturedCourses(@PageableDefault(size = 12) Pageable pageable) {
        Page<Course> courses = courseService.getFeaturedCourses(pageable);
        return ResponseEntity.ok(courses);
    }

    @GetMapping("/top-rated")
    public ResponseEntity<Page<Course>> getTopRatedCourses(@PageableDefault(size = 12) Pageable pageable) {
        Page<Course> courses = courseService.getTopRatedCourses(pageable);
        return ResponseEntity.ok(courses);
    }

    @GetMapping("/most-enrolled")
    public ResponseEntity<Page<Course>> getMostEnrolledCourses(@PageableDefault(size = 12) Pageable pageable) {
        Page<Course> courses = courseService.getMostEnrolledCourses(pageable);
        return ResponseEntity.ok(courses);
    }

    @PutMapping("/{courseId}/publish")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Course> publishCourse(@PathVariable String courseId) {
        Course publishedCourse = courseService.publishCourse(courseId);
        return ResponseEntity.ok(publishedCourse);
    }

    @PutMapping("/{courseId}/unpublish")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Course> unpublishCourse(@PathVariable String courseId) {
        Course unpublishedCourse = courseService.unpublishCourse(courseId);
        return ResponseEntity.ok(unpublishedCourse);
    }

    @DeleteMapping("/{courseId}")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCourse(@PathVariable String courseId) {
        courseService.deleteCourse(courseId);
        return ResponseEntity.noContent().build();
    }
}
