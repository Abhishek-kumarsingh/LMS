package com.lms.controller;

import com.lms.entity.Category;
import com.lms.service.CategoryService;
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
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class CategoryController {

    private final CategoryService categoryService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Category> createCategory(@Valid @RequestBody Category category) {
        Category createdCategory = categoryService.createCategory(category);
        return ResponseEntity.ok(createdCategory);
    }

    @PutMapping("/{categoryId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Category> updateCategory(@PathVariable String categoryId,
                                                 @Valid @RequestBody Category category) {
        Category updatedCategory = categoryService.updateCategory(categoryId, category);
        return ResponseEntity.ok(updatedCategory);
    }

    @PutMapping("/{categoryId}/toggle-status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Category> toggleCategoryStatus(@PathVariable String categoryId) {
        Category category = categoryService.toggleCategoryStatus(categoryId);
        return ResponseEntity.ok(category);
    }

    @DeleteMapping("/{categoryId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCategory(@PathVariable String categoryId) {
        categoryService.deleteCategory(categoryId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{categoryId}")
    public ResponseEntity<Category> getCategory(@PathVariable String categoryId) {
        Category category = categoryService.getCategoryById(categoryId);
        return ResponseEntity.ok(category);
    }

    @GetMapping("/name/{name}")
    public ResponseEntity<Category> getCategoryByName(@PathVariable String name) {
        Category category = categoryService.getCategoryByName(name);
        return ResponseEntity.ok(category);
    }

    @GetMapping
    public ResponseEntity<List<Category>> getAllActiveCategories() {
        List<Category> categories = categoryService.getAllActiveCategories();
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/paginated")
    public ResponseEntity<Page<Category>> getAllActiveCategoriesPaginated(@PageableDefault(size = 20) Pageable pageable) {
        Page<Category> categories = categoryService.getAllActiveCategories(pageable);
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<Category>> getAllCategories(@PageableDefault(size = 20) Pageable pageable) {
        Page<Category> categories = categoryService.getAllCategories(pageable);
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/search")
    public ResponseEntity<List<Category>> searchCategories(@RequestParam String keyword) {
        List<Category> categories = categoryService.searchCategories(keyword);
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/with-course-count")
    public ResponseEntity<List<Object[]>> getCategoriesWithCourseCount() {
        List<Object[]> categories = categoryService.getCategoriesWithCourseCount();
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/with-published-courses")
    public ResponseEntity<List<Category>> getCategoriesWithPublishedCourses() {
        List<Category> categories = categoryService.getCategoriesWithPublishedCourses();
        return ResponseEntity.ok(categories);
    }
}
