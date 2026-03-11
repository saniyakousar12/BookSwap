package com.bookswap.repository;

import com.bookswap.entity.Book;
import com.bookswap.entity.Review;
import com.bookswap.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    
    // Book reviews
    Page<Review> findByBookIdAndIsBookReviewTrue(Long bookId, Pageable pageable);
    
    List<Review> findByBookIdAndIsBookReviewTrue(Long bookId);
    
    // User reviews
    Page<Review> findByRevieweeIdAndIsBookReviewFalse(Long userId, Pageable pageable);
    
    List<Review> findByRevieweeIdAndIsBookReviewFalse(Long userId);
    
    // Check if user has already reviewed a book
    boolean existsByReviewerIdAndBookIdAndIsBookReviewTrue(Long reviewerId, Long bookId);
    
    // Check if user has already rated another user for a transaction
    boolean existsByReviewerIdAndRevieweeIdAndTransactionId(Long reviewerId, Long revieweeId, Long transactionId);
    
    // Average rating for a book
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.book.id = :bookId AND r.isBookReview = true")
    Double getAverageRatingForBook(@Param("bookId") Long bookId);
    
    // Average rating for a user
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.reviewee.id = :userId AND r.isBookReview = false")
    Double getAverageRatingForUser(@Param("userId") Long userId);
    
    // Count reviews for a book
    long countByBookIdAndIsBookReviewTrue(Long bookId);
    
    // Count reviews for a user
    long countByRevieweeIdAndIsBookReviewFalse(Long userId);
}