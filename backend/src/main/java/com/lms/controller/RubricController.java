package com.lms.controller;

import com.lms.entity.Rubric;
import com.lms.service.RubricService;
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
@RequestMapping("/api/rubrics")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class RubricController {

    private final RubricService rubricService;

    @PostMapping
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Rubric> createRubric(@Valid @RequestBody Rubric rubric) {
        Rubric createdRubric = rubricService.createRubric(rubric);
        return ResponseEntity.ok(createdRubric);
    }

    @PutMapping("/{rubricId}")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Rubric> updateRubric(@PathVariable String rubricId,
                                             @Valid @RequestBody Rubric rubric) {
        Rubric updatedRubric = rubricService.updateRubric(rubricId, rubric);
        return ResponseEntity.ok(updatedRubric);
    }

    @PutMapping("/{rubricId}/publish")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Rubric> publishRubric(@PathVariable String rubricId) {
        Rubric publishedRubric = rubricService.publishRubric(rubricId);
        return ResponseEntity.ok(publishedRubric);
    }

    @GetMapping("/{rubricId}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Rubric> getRubric(@PathVariable String rubricId) {
        Rubric rubric = rubricService.getRubricById(rubricId);
        return ResponseEntity.ok(rubric);
    }

    @GetMapping("/course/{courseId}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Page<Rubric>> getRubricsByCourse(@PathVariable String courseId,
                                                         @PageableDefault(size = 20) Pageable pageable) {
        Page<Rubric> rubrics = rubricService.getRubricsByCourse(courseId, pageable);
        return ResponseEntity.ok(rubrics);
    }

    @GetMapping("/course/{courseId}/published")
    @PreAuthorize("hasRole('STUDENT') or hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<List<Rubric>> getPublishedRubricsByCourse(@PathVariable String courseId) {
        List<Rubric> rubrics = rubricService.getPublishedRubricsByCourse(courseId);
        return ResponseEntity.ok(rubrics);
    }

    @GetMapping("/my-rubrics")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Page<Rubric>> getInstructorRubrics(@PageableDefault(size = 20) Pageable pageable) {
        Page<Rubric> rubrics = rubricService.getInstructorRubrics(pageable);
        return ResponseEntity.ok(rubrics);
    }

    @GetMapping("/course/{courseId}/search")
    @PreAuthorize("hasRole('STUDENT') or hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Page<Rubric>> searchRubrics(@PathVariable String courseId,
                                                    @RequestParam String searchTerm,
                                                    @PageableDefault(size = 20) Pageable pageable) {
        Page<Rubric> rubrics = rubricService.searchRubrics(courseId, searchTerm, pageable);
        return ResponseEntity.ok(rubrics);
    }

    @PostMapping("/{rubricId}/duplicate")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Rubric> duplicateRubric(@PathVariable String rubricId,
                                                @RequestParam(required = false) String newTitle) {
        Rubric duplicatedRubric = rubricService.duplicateRubric(rubricId, newTitle);
        return ResponseEntity.ok(duplicatedRubric);
    }

    @DeleteMapping("/{rubricId}")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Void> deleteRubric(@PathVariable String rubricId) {
        rubricService.deleteRubric(rubricId);
        return ResponseEntity.noContent().build();
    }
}
