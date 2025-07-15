package com.lms.service;

import com.lms.entity.Category;
import com.lms.entity.User;
import com.lms.exception.BadRequestException;
import com.lms.exception.ResourceNotFoundException;
import com.lms.repository.CategoryRepository;
import com.lms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
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
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public Category createCategory(Category category) {
        User currentUser = getCurrentUser();
        
        if (!currentUser.isAdmin()) {
            throw new BadRequestException("Only admins can create categories");
        }

        // Check if category name already exists
        if (categoryRepository.existsByName(category.getName())) {
            throw new BadRequestException("Category with this name already exists");
        }

        // Set category properties
        category.setId(UUID.randomUUID().toString());
        category.setActive(true);

        Category savedCategory = categoryRepository.save(category);
        log.info("Category created: {} by admin: {}", savedCategory.getName(), currentUser.getEmail());
        
        return savedCategory;
    }

    @Caching(evict = {
        @CacheEvict(value = "categories", key = "#categoryId"),
        @CacheEvict(value = "categories", allEntries = true),
        @CacheEvict(value = "search", allEntries = true)
    })
    public Category updateCategory(String categoryId, Category categoryUpdate) {
        Category existingCategory = getCategoryById(categoryId);
        User currentUser = getCurrentUser();

        if (!currentUser.isAdmin()) {
            throw new BadRequestException("Only admins can update categories");
        }

        // Check if new name already exists (if name is being changed)
        if (categoryUpdate.getName() != null && 
            !categoryUpdate.getName().equals(existingCategory.getName()) &&
            categoryRepository.existsByName(categoryUpdate.getName())) {
            throw new BadRequestException("Category with this name already exists");
        }

        // Update fields
        if (categoryUpdate.getName() != null) {
            existingCategory.setName(categoryUpdate.getName());
        }
        if (categoryUpdate.getDescription() != null) {
            existingCategory.setDescription(categoryUpdate.getDescription());
        }
        if (categoryUpdate.getIcon() != null) {
            existingCategory.setIcon(categoryUpdate.getIcon());
        }
        if (categoryUpdate.getColor() != null) {
            existingCategory.setColor(categoryUpdate.getColor());
        }

        Category savedCategory = categoryRepository.save(existingCategory);
        log.info("Category updated: {}", savedCategory.getName());
        
        return savedCategory;
    }

    @Caching(evict = {
        @CacheEvict(value = "categories", key = "#categoryId"),
        @CacheEvict(value = "categories", allEntries = true)
    })
    public Category toggleCategoryStatus(String categoryId) {
        Category category = getCategoryById(categoryId);
        User currentUser = getCurrentUser();

        if (!currentUser.isAdmin()) {
            throw new BadRequestException("Only admins can toggle category status");
        }

        category.setActive(!category.isActive());
        Category savedCategory = categoryRepository.save(category);
        
        log.info("Category {} status changed to: {}", 
                savedCategory.getName(), savedCategory.isActive() ? "active" : "inactive");
        
        return savedCategory;
    }

    @Caching(evict = {
        @CacheEvict(value = "categories", key = "#categoryId"),
        @CacheEvict(value = "categories", allEntries = true),
        @CacheEvict(value = "search", allEntries = true)
    })
    public void deleteCategory(String categoryId) {
        Category category = getCategoryById(categoryId);
        User currentUser = getCurrentUser();

        if (!currentUser.isAdmin()) {
            throw new BadRequestException("Only admins can delete categories");
        }

        // Check if category has courses
        if (!category.getCourses().isEmpty()) {
            throw new BadRequestException("Cannot delete category with existing courses");
        }

        categoryRepository.delete(category);
        log.info("Category deleted: {}", category.getName());
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "categories", key = "#categoryId")
    public Category getCategoryById(String categoryId) {
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "categories", key = "'name:' + #name")
    public Category getCategoryByName(String name) {
        return categoryRepository.findByName(name)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "categories", key = "'active-list'")
    public List<Category> getAllActiveCategories() {
        return categoryRepository.findByIsActiveTrueOrderByName();
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "categories", key = "'active-page:' + #pageable.pageNumber + ':' + #pageable.pageSize")
    public Page<Category> getAllActiveCategories(Pageable pageable) {
        return categoryRepository.findByIsActiveTrueOrderByName(pageable);
    }

    @Transactional(readOnly = true)
    public Page<Category> getAllCategories(Pageable pageable) {
        User currentUser = getCurrentUser();

        if (!currentUser.isAdmin()) {
            throw new BadRequestException("Only admins can view all categories");
        }

        return categoryRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "search", key = "'categories:' + #keyword")
    public List<Category> searchCategories(String keyword) {
        return categoryRepository.searchByName(keyword);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "categories", key = "'with-course-count'")
    public List<Object[]> getCategoriesWithCourseCount() {
        return categoryRepository.getCategoriesWithCourseCount();
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "categories", key = "'with-published-courses'")
    public List<Category> getCategoriesWithPublishedCourses() {
        return categoryRepository.getCategoriesWithPublishedCourses();
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
