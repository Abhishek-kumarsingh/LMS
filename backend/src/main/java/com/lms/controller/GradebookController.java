package com.lms.controller;

import com.lms.entity.CourseGrade;
import com.lms.entity.GradebookCategory;
import com.lms.service.GradebookService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/gradebook")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class GradebookController {

    private final GradebookService gradebookService;

    // Gradebook Categories
    @PostMapping("/courses/{courseId}/categories")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<GradebookCategory> createCategory(@PathVariable String courseId,
                                                          @Valid @RequestBody GradebookCategory category) {
        GradebookCategory createdCategory = gradebookService.createCategory(courseId, category);
        return ResponseEntity.ok(createdCategory);
    }

    @PutMapping("/categories/{categoryId}")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<GradebookCategory> updateCategory(@PathVariable String categoryId,
                                                          @Valid @RequestBody GradebookCategory category) {
        GradebookCategory updatedCategory = gradebookService.updateCategory(categoryId, category);
        return ResponseEntity.ok(updatedCategory);
    }

    @GetMapping("/courses/{courseId}/categories")
    @PreAuthorize("hasRole('STUDENT') or hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<List<GradebookCategory>> getCategoriesByCourse(@PathVariable String courseId) {
        List<GradebookCategory> categories = gradebookService.getCategoriesByCourse(courseId);
        return ResponseEntity.ok(categories);
    }

    // Course Grades
    @PutMapping("/courses/{courseId}/students/{studentId}/recalculate")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<CourseGrade> updateCourseGrade(@PathVariable String courseId,
                                                       @PathVariable String studentId) {
        CourseGrade courseGrade = gradebookService.updateCourseGrade(courseId, studentId);
        return ResponseEntity.ok(courseGrade);
    }

    @GetMapping("/courses/{courseId}/students/{studentId}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<CourseGrade> getCourseGrade(@PathVariable String courseId,
                                                    @PathVariable String studentId) {
        Optional<CourseGrade> courseGrade = gradebookService.getCourseGrade(courseId, studentId);
        return courseGrade.map(ResponseEntity::ok)
                         .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/courses/{courseId}/grades")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<List<CourseGrade>> getAllCourseGrades(@PathVariable String courseId) {
        List<CourseGrade> courseGrades = gradebookService.getAllCourseGrades(courseId);
        return ResponseEntity.ok(courseGrades);
    }

    @GetMapping("/courses/{courseId}/statistics")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getCourseGradeStatistics(@PathVariable String courseId) {
        Map<String, Object> statistics = gradebookService.getCourseGradeStatistics(courseId);
        return ResponseEntity.ok(statistics);
    }

    @PutMapping("/courses/{courseId}/recalculate-all")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> recalculateAllCourseGrades(@PathVariable String courseId) {
        gradebookService.recalculateAllCourseGrades(courseId);
        return ResponseEntity.ok(Map.of("message", "All course grades recalculated successfully"));
    }

    @GetMapping("/courses/{courseId}/students-needing-attention")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<List<CourseGrade>> getStudentsNeedingAttention(@PathVariable String courseId,
                                                                        @RequestParam(defaultValue = "70.0") BigDecimal threshold) {
        List<CourseGrade> studentsNeedingAttention = gradebookService.getStudentsNeedingAttention(courseId, threshold);
        return ResponseEntity.ok(studentsNeedingAttention);
    }
}
