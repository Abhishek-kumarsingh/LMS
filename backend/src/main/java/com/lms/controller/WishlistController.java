package com.lms.controller;

import com.lms.entity.Wishlist;
import com.lms.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class WishlistController {

    private final WishlistService wishlistService;

    @PostMapping("/courses/{courseId}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Wishlist> addToWishlist(@PathVariable String courseId) {
        Wishlist wishlistItem = wishlistService.addToWishlist(courseId);
        return ResponseEntity.ok(wishlistItem);
    }

    @DeleteMapping("/courses/{courseId}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Void> removeFromWishlist(@PathVariable String courseId) {
        wishlistService.removeFromWishlist(courseId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{wishlistId}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Void> removeFromWishlistById(@PathVariable String wishlistId) {
        wishlistService.removeFromWishlistById(wishlistId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{wishlistId}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Wishlist> getWishlistItem(@PathVariable String wishlistId) {
        Wishlist wishlistItem = wishlistService.getWishlistItemById(wishlistId);
        return ResponseEntity.ok(wishlistItem);
    }

    @GetMapping("/courses/{courseId}/check")
    @PreAuthorize("hasRole('STUDENT') or hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Boolean> checkWishlist(@PathVariable String courseId) {
        boolean isInWishlist = wishlistService.isInWishlist(courseId);
        return ResponseEntity.ok(isInWishlist);
    }

    @GetMapping("/my-wishlist")
    @PreAuthorize("hasRole('STUDENT') or hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Page<Wishlist>> getUserWishlist(@PageableDefault(size = 12) Pageable pageable) {
        Page<Wishlist> wishlist = wishlistService.getUserWishlist(pageable);
        return ResponseEntity.ok(wishlist);
    }

    @GetMapping("/my-wishlist/list")
    @PreAuthorize("hasRole('STUDENT') or hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<List<Wishlist>> getUserWishlistAsList() {
        List<Wishlist> wishlist = wishlistService.getUserWishlistAsList();
        return ResponseEntity.ok(wishlist);
    }

    @GetMapping("/my-wishlist/count")
    @PreAuthorize("hasRole('STUDENT') or hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Long> getUserWishlistCount() {
        long count = wishlistService.getUserWishlistCount();
        return ResponseEntity.ok(count);
    }

    @GetMapping("/my-wishlist/category/{categoryId}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Page<Wishlist>> getUserWishlistByCategory(@PathVariable String categoryId,
                                                                  @PageableDefault(size = 12) Pageable pageable) {
        Page<Wishlist> wishlist = wishlistService.getUserWishlistByCategory(categoryId, pageable);
        return ResponseEntity.ok(wishlist);
    }

    @GetMapping("/my-wishlist/price-range")
    @PreAuthorize("hasRole('STUDENT') or hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Page<Wishlist>> getUserWishlistByPriceRange(@RequestParam Double minPrice,
                                                                    @RequestParam Double maxPrice,
                                                                    @PageableDefault(size = 12) Pageable pageable) {
        Page<Wishlist> wishlist = wishlistService.getUserWishlistByPriceRange(minPrice, maxPrice, pageable);
        return ResponseEntity.ok(wishlist);
    }

    @GetMapping("/courses/{courseId}/count")
    public ResponseEntity<Long> getCourseWishlistCount(@PathVariable String courseId) {
        long count = wishlistService.getCourseWishlistCount(courseId);
        return ResponseEntity.ok(count);
    }

    @GetMapping("/most-wishlisted")
    public ResponseEntity<Page<Object[]>> getMostWishlistedCourses(@PageableDefault(size = 10) Pageable pageable) {
        Page<Object[]> courses = wishlistService.getMostWishlistedCourses(pageable);
        return ResponseEntity.ok(courses);
    }

    @DeleteMapping("/my-wishlist/clear")
    @PreAuthorize("hasRole('STUDENT') or hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Void> clearUserWishlist() {
        wishlistService.clearUserWishlist();
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/courses/{courseId}/move-to-enrollment")
    @PreAuthorize("hasRole('STUDENT') or hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Void> moveToEnrollment(@PathVariable String courseId) {
        wishlistService.moveToEnrollment(courseId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/courses/{courseId}/wishlists")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Page<Wishlist>> getCourseWishlists(@PathVariable String courseId,
                                                           @PageableDefault(size = 12) Pageable pageable) {
        Page<Wishlist> wishlists = wishlistService.getCourseWishlists(courseId, pageable);
        return ResponseEntity.ok(wishlists);
    }
}
