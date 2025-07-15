package com.lms.controller;

import com.lms.entity.AssignmentGrade;
import com.lms.service.GradingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/grading")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class GradingController {

    private final GradingService gradingService;

    @PostMapping("/submissions/{submissionId}")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<AssignmentGrade> gradeSubmission(@PathVariable String submissionId,
                                                         @Valid @RequestBody AssignmentGrade grade) {
        AssignmentGrade createdGrade = gradingService.gradeSubmission(submissionId, grade);
        return ResponseEntity.ok(createdGrade);
    }

    @PutMapping("/grades/{gradeId}")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<AssignmentGrade> updateGrade(@PathVariable String gradeId,
                                                     @Valid @RequestBody AssignmentGrade grade) {
        AssignmentGrade updatedGrade = gradingService.updateGrade(gradeId, grade);
        return ResponseEntity.ok(updatedGrade);
    }

    @PutMapping("/grades/{gradeId}/release")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<AssignmentGrade> releaseGrade(@PathVariable String gradeId) {
        AssignmentGrade releasedGrade = gradingService.releaseGrade(gradeId);
        return ResponseEntity.ok(releasedGrade);
    }

    @PutMapping("/assignments/{assignmentId}/release-all")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> releaseAllGrades(@PathVariable String assignmentId) {
        gradingService.releaseAllGrades(assignmentId);
        return ResponseEntity.ok(Map.of("message", "All grades released successfully"));
    }

    @GetMapping("/grades/{gradeId}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<AssignmentGrade> getGrade(@PathVariable String gradeId) {
        AssignmentGrade grade = gradingService.getGradeById(gradeId);
        return ResponseEntity.ok(grade);
    }

    @GetMapping("/submissions/{submissionId}/grade")
    @PreAuthorize("hasRole('STUDENT') or hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<AssignmentGrade> getGradeBySubmission(@PathVariable String submissionId) {
        Optional<AssignmentGrade> grade = gradingService.getGradeBySubmission(submissionId);
        return grade.map(ResponseEntity::ok)
                   .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/assignments/{assignmentId}/grades")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Page<AssignmentGrade>> getGradesByAssignment(@PathVariable String assignmentId,
                                                                     @PageableDefault(size = 20) Pageable pageable) {
        Page<AssignmentGrade> grades = gradingService.getGradesByAssignment(assignmentId, pageable);
        return ResponseEntity.ok(grades);
    }

    @GetMapping("/students/{studentId}/grades")
    @PreAuthorize("hasRole('STUDENT') or hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Page<AssignmentGrade>> getStudentGrades(@PathVariable String studentId,
                                                                @PageableDefault(size = 20) Pageable pageable) {
        Page<AssignmentGrade> grades = gradingService.getStudentGrades(studentId, pageable);
        return ResponseEntity.ok(grades);
    }

    @GetMapping("/students/{studentId}/released-grades")
    @PreAuthorize("hasRole('STUDENT') or hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<List<AssignmentGrade>> getReleasedGrades(@PathVariable String studentId) {
        List<AssignmentGrade> grades = gradingService.getReleasedGrades(studentId);
        return ResponseEntity.ok(grades);
    }

    @GetMapping("/assignments/{assignmentId}/average")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, BigDecimal>> getAverageGradeForAssignment(@PathVariable String assignmentId) {
        Optional<BigDecimal> average = gradingService.getAverageGradeForAssignment(assignmentId);
        return ResponseEntity.ok(Map.of("averageGrade", average.orElse(BigDecimal.ZERO)));
    }

    @GetMapping("/students/{studentId}/courses/{courseId}/average")
    @PreAuthorize("hasRole('STUDENT') or hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, BigDecimal>> getStudentAverageInCourse(@PathVariable String studentId,
                                                                            @PathVariable String courseId) {
        Optional<BigDecimal> average = gradingService.getStudentAverageInCourse(studentId, courseId);
        return ResponseEntity.ok(Map.of("averageGrade", average.orElse(BigDecimal.ZERO)));
    }
}
