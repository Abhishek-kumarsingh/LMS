package com.lms.service;

import com.lms.entity.Course;
import com.lms.entity.User;
import com.lms.entity.Wishlist;
import com.lms.exception.BadRequestException;
import com.lms.exception.ResourceNotFoundException;
import com.lms.repository.CourseRepository;
import com.lms.repository.EnrollmentRepository;
import com.lms.repository.UserRepository;
import com.lms.repository.WishlistRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;

    public Wishlist addToWishlist(String courseId) {
        User currentUser = getCurrentUser();
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        // Check if course is published
        if (!course.isPublished()) {
            throw new BadRequestException("Cannot add unpublished course to wishlist");
        }

        // Check if user is already enrolled in the course
        if (enrollmentRepository.existsByUserAndCourse(currentUser, course)) {
            throw new BadRequestException("Cannot add enrolled course to wishlist");
        }

        // Check if course is already in wishlist
        if (wishlistRepository.existsByUserAndCourse(currentUser, course)) {
            throw new BadRequestException("Course is already in your wishlist");
        }

        // Check if user is the instructor of the course
        if (course.getInstructor().getId().equals(currentUser.getId())) {
            throw new BadRequestException("Cannot add your own course to wishlist");
        }

        // Create wishlist item
        Wishlist wishlistItem = new Wishlist();
        wishlistItem.setId(UUID.randomUUID().toString());
        wishlistItem.setUser(currentUser);
        wishlistItem.setCourse(course);

        Wishlist savedWishlistItem = wishlistRepository.save(wishlistItem);

        log.info("Course {} added to wishlist by user {}", course.getTitle(), currentUser.getEmail());

        return savedWishlistItem;
    }

    public void removeFromWishlist(String courseId) {
        User currentUser = getCurrentUser();
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        Wishlist wishlistItem = wishlistRepository.findByUserAndCourse(currentUser, course)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found in wishlist"));

        wishlistRepository.delete(wishlistItem);

        log.info("Course {} removed from wishlist by user {}", course.getTitle(), currentUser.getEmail());
    }

    public void removeFromWishlistById(String wishlistId) {
        Wishlist wishlistItem = getWishlistItemById(wishlistId);
        User currentUser = getCurrentUser();

        // Check if user owns this wishlist item
        if (!wishlistItem.getUser().getId().equals(currentUser.getId())) {
            throw new BadRequestException("You can only remove items from your own wishlist");
        }

        wishlistRepository.delete(wishlistItem);

        log.info("Wishlist item {} removed by user {}", wishlistId, currentUser.getEmail());
    }

    @Transactional(readOnly = true)
    public Wishlist getWishlistItemById(String wishlistId) {
        return wishlistRepository.findById(wishlistId)
                .orElseThrow(() -> new ResourceNotFoundException("Wishlist item not found"));
    }

    @Transactional(readOnly = true)
    public boolean isInWishlist(String courseId) {
        User currentUser = getCurrentUser();
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        return wishlistRepository.existsByUserAndCourse(currentUser, course);
    }

    @Transactional(readOnly = true)
    public Page<Wishlist> getUserWishlist(Pageable pageable) {
        User currentUser = getCurrentUser();
        return wishlistRepository.findByUserOrderByAddedAtDesc(currentUser, pageable);
    }

    @Transactional(readOnly = true)
    public List<Wishlist> getUserWishlistAsList() {
        User currentUser = getCurrentUser();
        return wishlistRepository.findByUserOrderByAddedAtDesc(currentUser);
    }

    @Transactional(readOnly = true)
    public long getUserWishlistCount() {
        User currentUser = getCurrentUser();
        return wishlistRepository.countByUser(currentUser);
    }

    @Transactional(readOnly = true)
    public Page<Wishlist> getUserWishlistByCategory(String categoryId, Pageable pageable) {
        User currentUser = getCurrentUser();
        return wishlistRepository.findByUserAndCategoryId(currentUser, categoryId, pageable);
    }

    @Transactional(readOnly = true)
    public Page<Wishlist> getUserWishlistByPriceRange(Double minPrice, Double maxPrice, Pageable pageable) {
        User currentUser = getCurrentUser();
        return wishlistRepository.findByUserAndPriceRange(currentUser, minPrice, maxPrice, pageable);
    }

    @Transactional(readOnly = true)
    public long getCourseWishlistCount(String courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        return wishlistRepository.countByCourse(course);
    }

    @Transactional(readOnly = true)
    public Page<Object[]> getMostWishlistedCourses(Pageable pageable) {
        return wishlistRepository.findMostWishlistedCourses(pageable);
    }

    public void clearUserWishlist() {
        User currentUser = getCurrentUser();
        List<Wishlist> userWishlist = wishlistRepository.findByUserOrderByAddedAtDesc(currentUser);
        
        if (!userWishlist.isEmpty()) {
            wishlistRepository.deleteAll(userWishlist);
            log.info("Wishlist cleared for user {}", currentUser.getEmail());
        }
    }

    public void moveToEnrollment(String courseId) {
        User currentUser = getCurrentUser();
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        // Check if course is in wishlist
        Wishlist wishlistItem = wishlistRepository.findByUserAndCourse(currentUser, course)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found in wishlist"));

        // Remove from wishlist
        wishlistRepository.delete(wishlistItem);

        log.info("Course {} moved from wishlist to enrollment for user {}", 
                course.getTitle(), currentUser.getEmail());
    }

    @Transactional(readOnly = true)
    public Page<Wishlist> getCourseWishlists(String courseId, Pageable pageable) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        
        User currentUser = getCurrentUser();
        
        // Check if user is instructor or admin
        if (!currentUser.isAdmin() && !course.getInstructor().getId().equals(currentUser.getId())) {
            throw new BadRequestException("You can only view wishlists for your own courses");
        }

        return wishlistRepository.findByCourseOrderByAddedAtDesc(course, pageable);
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
