package com.lms.controller;

import com.lms.entity.Assignment;
import com.lms.service.AssignmentService;
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
@RequestMapping("/api/assignments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class AssignmentController {

    private final AssignmentService assignmentService;

    @PostMapping
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Assignment> createAssignment(@Valid @RequestBody Assignment assignment) {
        Assignment createdAssignment = assignmentService.createAssignment(assignment);
        return ResponseEntity.ok(createdAssignment);
    }

    @PutMapping("/{assignmentId}")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Assignment> updateAssignment(@PathVariable String assignmentId,
                                                     @Valid @RequestBody Assignment assignment) {
        Assignment updatedAssignment = assignmentService.updateAssignment(assignmentId, assignment);
        return ResponseEntity.ok(updatedAssignment);
    }

    @PutMapping("/{assignmentId}/publish")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Assignment> publishAssignment(@PathVariable String assignmentId) {
        Assignment publishedAssignment = assignmentService.publishAssignment(assignmentId);
        return ResponseEntity.ok(publishedAssignment);
    }

    @GetMapping("/{assignmentId}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Assignment> getAssignment(@PathVariable String assignmentId) {
        Assignment assignment = assignmentService.getAssignmentById(assignmentId);
        return ResponseEntity.ok(assignment);
    }

    @GetMapping("/course/{courseId}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Page<Assignment>> getAssignmentsByCourse(@PathVariable String courseId,
                                                                 @PageableDefault(size = 20) Pageable pageable) {
        Page<Assignment> assignments = assignmentService.getAssignmentsByCourse(courseId, pageable);
        return ResponseEntity.ok(assignments);
    }

    @GetMapping("/course/{courseId}/upcoming")
    @PreAuthorize("hasRole('STUDENT') or hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<List<Assignment>> getUpcomingAssignments(@PathVariable String courseId) {
        List<Assignment> assignments = assignmentService.getUpcomingAssignments(courseId);
        return ResponseEntity.ok(assignments);
    }

    @GetMapping("/course/{courseId}/overdue")
    @PreAuthorize("hasRole('STUDENT') or hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<List<Assignment>> getOverdueAssignments(@PathVariable String courseId) {
        List<Assignment> assignments = assignmentService.getOverdueAssignments(courseId);
        return ResponseEntity.ok(assignments);
    }

    @GetMapping("/course/{courseId}/available")
    @PreAuthorize("hasRole('STUDENT') or hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<List<Assignment>> getAvailableAssignments(@PathVariable String courseId) {
        List<Assignment> assignments = assignmentService.getAvailableAssignments(courseId);
        return ResponseEntity.ok(assignments);
    }

    @GetMapping("/my-assignments")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Page<Assignment>> getInstructorAssignments(@PageableDefault(size = 20) Pageable pageable) {
        Page<Assignment> assignments = assignmentService.getInstructorAssignments(pageable);
        return ResponseEntity.ok(assignments);
    }

    @GetMapping("/course/{courseId}/requiring-grading")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<List<Assignment>> getAssignmentsRequiringGrading(@PathVariable String courseId) {
        List<Assignment> assignments = assignmentService.getAssignmentsRequiringGrading(courseId);
        return ResponseEntity.ok(assignments);
    }

    @GetMapping("/course/{courseId}/search")
    @PreAuthorize("hasRole('STUDENT') or hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Page<Assignment>> searchAssignments(@PathVariable String courseId,
                                                            @RequestParam String searchTerm,
                                                            @PageableDefault(size = 20) Pageable pageable) {
        Page<Assignment> assignments = assignmentService.searchAssignments(courseId, searchTerm, pageable);
        return ResponseEntity.ok(assignments);
    }

    @DeleteMapping("/{assignmentId}")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Void> deleteAssignment(@PathVariable String assignmentId) {
        assignmentService.deleteAssignment(assignmentId);
        return ResponseEntity.noContent().build();
    }
}
