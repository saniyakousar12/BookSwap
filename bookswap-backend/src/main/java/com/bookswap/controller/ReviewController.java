package com.bookswap.controller;

import com.bookswap.dto.ReviewDTO;
import com.bookswap.dto.ReviewRequestDTO;
import com.bookswap.service.JwtTokenProvider;
import com.bookswap.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class ReviewController {

    private final ReviewService reviewService;
    private final JwtTokenProvider jwtTokenProvider;

    private Long getUserIdFromToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }
        String token = authHeader.substring(7);
        return jwtTokenProvider.getUserIdFromToken(token);
    }

    // ===== CREATE BOOK REVIEW =====
    @PostMapping("/book")
    public ResponseEntity<?> createBookReview(
            @Valid @RequestBody ReviewRequestDTO request,
            @RequestHeader("Authorization") String authHeader) {
        
        Long userId = getUserIdFromToken(authHeader);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            ReviewDTO review = reviewService.createBookReview(request, userId);
            return ResponseEntity.status(HttpStatus.CREATED).body(review);
        } catch (RuntimeException e) {
            log.error("Error creating book review: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ===== CREATE USER REVIEW =====
    @PostMapping("/user")
    public ResponseEntity<?> createUserReview(
            @Valid @RequestBody ReviewRequestDTO request,
            @RequestHeader("Authorization") String authHeader) {
        
        Long userId = getUserIdFromToken(authHeader);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            ReviewDTO review = reviewService.createUserReview(request, userId);
            return ResponseEntity.status(HttpStatus.CREATED).body(review);
        } catch (RuntimeException e) {
            log.error("Error creating user review: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ===== GET BOOK REVIEWS =====
    @GetMapping("/book/{bookId}")
    public ResponseEntity<Map<String, Object>> getBookReviews(
            @PathVariable Long bookId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<ReviewDTO> reviews = reviewService.getBookReviews(bookId, pageable);
        
        Map<String, Object> response = new HashMap<>();
        response.put("content", reviews.getContent());
        response.put("totalElements", reviews.getTotalElements());
        response.put("totalPages", reviews.getTotalPages());
        response.put("currentPage", reviews.getNumber());
        response.put("last", reviews.isLast());
        
        return ResponseEntity.ok(response);
    }

    // ===== GET USER REVIEWS =====
    @GetMapping("/user/{userId}")
    public ResponseEntity<Map<String, Object>> getUserReviews(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<ReviewDTO> reviews = reviewService.getUserReviews(userId, pageable);
        
        Map<String, Object> response = new HashMap<>();
        response.put("content", reviews.getContent());
        response.put("totalElements", reviews.getTotalElements());
        response.put("totalPages", reviews.getTotalPages());
        response.put("currentPage", reviews.getNumber());
        
        return ResponseEntity.ok(response);
    }

    // ===== GET AVERAGE RATING FOR BOOK =====
    @GetMapping("/book/{bookId}/average")
    public ResponseEntity<Double> getAverageBookRating(@PathVariable Long bookId) {
        Double average = reviewService.getAverageBookRating(bookId);
        return ResponseEntity.ok(average);
    }

    // ===== GET REVIEW COUNT FOR BOOK =====
    @GetMapping("/book/{bookId}/count")
    public ResponseEntity<Long> getBookReviewCount(@PathVariable Long bookId) {
        Long count = reviewService.getBookReviewCount(bookId);
        return ResponseEntity.ok(count);
    }

    // ===== GET AVERAGE RATING FOR USER =====
    @GetMapping("/user/{userId}/average")
    public ResponseEntity<Double> getAverageUserRating(@PathVariable Long userId) {
        Double average = reviewService.getAverageUserRating(userId);
        return ResponseEntity.ok(average);
    }

    // ===== GET REVIEW COUNT FOR USER =====
    @GetMapping("/user/{userId}/count")
    public ResponseEntity<Long> getUserReviewCount(@PathVariable Long userId) {
        Long count = reviewService.getUserReviewCount(userId);
        return ResponseEntity.ok(count);
    }
}