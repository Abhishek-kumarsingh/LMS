package com.lms.controller;

import com.lms.entity.AssignmentSubmission;
import com.lms.service.AssignmentSubmissionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/assignment-submissions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class AssignmentSubmissionController {

    private final AssignmentSubmissionService submissionService;

    @PostMapping("/assignments/{assignmentId}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<AssignmentSubmission> submitAssignment(@PathVariable String assignmentId,
                                                               @Valid @RequestBody AssignmentSubmission submission) {
        AssignmentSubmission createdSubmission = submissionService.submitAssignment(assignmentId, submission);
        return ResponseEntity.ok(createdSubmission);
    }

    @PutMapping("/{submissionId}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<AssignmentSubmission> updateSubmission(@PathVariable String submissionId,
                                                               @Valid @RequestBody AssignmentSubmission submission) {
        AssignmentSubmission updatedSubmission = submissionService.updateSubmission(submissionId, submission);
        return ResponseEntity.ok(updatedSubmission);
    }

    @GetMapping("/{submissionId}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<AssignmentSubmission> getSubmission(@PathVariable String submissionId) {
        AssignmentSubmission submission = submissionService.getSubmissionById(submissionId);
        return ResponseEntity.ok(submission);
    }

    @GetMapping("/assignments/{assignmentId}")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Page<AssignmentSubmission>> getSubmissionsByAssignment(@PathVariable String assignmentId,
                                                                                @PageableDefault(size = 20) Pageable pageable) {
        Page<AssignmentSubmission> submissions = submissionService.getSubmissionsByAssignment(assignmentId, pageable);
        return ResponseEntity.ok(submissions);
    }

    @GetMapping("/assignments/{assignmentId}/students/{studentId}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<AssignmentSubmission> getStudentSubmission(@PathVariable String assignmentId,
                                                                    @PathVariable String studentId) {
        Optional<AssignmentSubmission> submission = submissionService.getStudentSubmission(assignmentId, studentId);
        return submission.map(ResponseEntity::ok)
                        .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/assignments/{assignmentId}/my-submission")
    @PreAuthorize("hasRole('STUDENT') or hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<AssignmentSubmission> getCurrentUserSubmission(@PathVariable String assignmentId) {
        Optional<AssignmentSubmission> submission = submissionService.getCurrentUserSubmission(assignmentId);
        return submission.map(ResponseEntity::ok)
                        .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/students/{studentId}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Page<AssignmentSubmission>> getStudentSubmissions(@PathVariable String studentId,
                                                                           @PageableDefault(size = 20) Pageable pageable) {
        Page<AssignmentSubmission> submissions = submissionService.getStudentSubmissions(studentId, pageable);
        return ResponseEntity.ok(submissions);
    }

    @GetMapping("/assignments/{assignmentId}/requiring-grading")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<List<AssignmentSubmission>> getSubmissionsRequiringGrading(@PathVariable String assignmentId) {
        List<AssignmentSubmission> submissions = submissionService.getSubmissionsRequiringGrading(assignmentId);
        return ResponseEntity.ok(submissions);
    }

    @GetMapping("/assignments/{assignmentId}/late")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<List<AssignmentSubmission>> getLateSubmissions(@PathVariable String assignmentId) {
        List<AssignmentSubmission> submissions = submissionService.getLateSubmissions(assignmentId);
        return ResponseEntity.ok(submissions);
    }

    @GetMapping("/assignments/{assignmentId}/status/{status}")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Page<AssignmentSubmission>> getSubmissionsByStatus(@PathVariable String assignmentId,
                                                                            @PathVariable AssignmentSubmission.SubmissionStatus status,
                                                                            @PageableDefault(size = 20) Pageable pageable) {
        Page<AssignmentSubmission> submissions = submissionService.getSubmissionsByStatus(assignmentId, status, pageable);
        return ResponseEntity.ok(submissions);
    }

    @GetMapping("/assignments/{assignmentId}/students/{studentId}/submitted")
    @PreAuthorize("hasRole('STUDENT') or hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Boolean>> hasStudentSubmitted(@PathVariable String assignmentId,
                                                                   @PathVariable String studentId) {
        boolean hasSubmitted = submissionService.hasStudentSubmitted(assignmentId, studentId);
        return ResponseEntity.ok(Map.of("hasSubmitted", hasSubmitted));
    }

    @GetMapping("/assignments/{assignmentId}/students/{studentId}/count")
    @PreAuthorize("hasRole('STUDENT') or hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Integer>> getSubmissionCount(@PathVariable String assignmentId,
                                                                  @PathVariable String studentId) {
        int count = submissionService.getSubmissionCount(assignmentId, studentId);
        return ResponseEntity.ok(Map.of("submissionCount", count));
    }

    @DeleteMapping("/{submissionId}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Void> deleteSubmission(@PathVariable String submissionId) {
        submissionService.deleteSubmission(submissionId);
        return ResponseEntity.noContent().build();
    }
}
