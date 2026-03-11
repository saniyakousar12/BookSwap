package com.bookswap.service;

import com.bookswap.dto.*;
import com.bookswap.entity.*;
import com.bookswap.enums.TransactionStatus;
import com.bookswap.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final NotificationService notificationService;
    private final BookService bookService;

    // ===== CREATE BOOK REVIEW =====
    public ReviewDTO createBookReview(ReviewRequestDTO request, Long reviewerId) {
        // Validate book exists
        Book book = bookRepository.findById(request.getBookId())
                .orElseThrow(() -> new RuntimeException("Book not found"));

        // Check if user has already reviewed this book
        if (reviewRepository.existsByReviewerIdAndBookIdAndIsBookReviewTrue(reviewerId, book.getId())) {
            throw new RuntimeException("You have already reviewed this book");
        }

        User reviewer = userRepository.findById(reviewerId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Review review = Review.builder()
                .book(book)
                .reviewer(reviewer)
                .rating(request.getRating())
                .comment(request.getComment())
                .isBookReview(true)
                .build();

        review = reviewRepository.save(review);
        log.info("Book review created: {} for book {}", review.getId(), book.getId());

        // Send notification to book owner using the specific method
        try {
            notificationService.sendNewReviewNotification(review);
        } catch (Exception e) {
            log.error("Failed to send review notification: {}", e.getMessage());
        }

        return convertToDTO(review);
    }

    // ===== CREATE USER REVIEW (after transaction) =====
    public ReviewDTO createUserReview(ReviewRequestDTO request, Long reviewerId) {
        // Validate transaction exists and is completed
        Transaction transaction = transactionRepository.findById(request.getTransactionId())
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        if (transaction.getStatus() != TransactionStatus.COMPLETED) {
            throw new RuntimeException("You can only review users after transaction is completed");
        }

        // Determine reviewee (the other user in the transaction)
        Long revieweeId;
        if (transaction.getRequester().getId().equals(reviewerId)) {
            revieweeId = transaction.getOwner().getId();
        } else if (transaction.getOwner().getId().equals(reviewerId)) {
            revieweeId = transaction.getRequester().getId();
        } else {
            throw new RuntimeException("You are not part of this transaction");
        }

        // Check if already reviewed
        if (reviewRepository.existsByReviewerIdAndRevieweeIdAndTransactionId(
                reviewerId, revieweeId, transaction.getId())) {
            throw new RuntimeException("You have already rated this user for this transaction");
        }

        User reviewer = userRepository.findById(reviewerId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        User reviewee = userRepository.findById(revieweeId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Review review = Review.builder()
                .reviewer(reviewer)
                .reviewee(reviewee)
                .transaction(transaction)
                .rating(request.getRating())
                .comment(request.getComment())
                .isBookReview(false)
                .build();

        review = reviewRepository.save(review);
        log.info("User review created: {} for user {}", review.getId(), revieweeId);

        // Send notification to reviewee using the specific method
        try {
            notificationService.sendUserRatingNotification(review);
        } catch (Exception e) {
            log.error("Failed to send rating notification: {}", e.getMessage());
        }

        return convertToDTO(review);
    }

    // ===== GET BOOK REVIEWS =====
    public Page<ReviewDTO> getBookReviews(Long bookId, Pageable pageable) {
        Page<Review> reviews = reviewRepository.findByBookIdAndIsBookReviewTrue(bookId, pageable);
        return reviews.map(this::convertToDTO);
    }

    // ===== GET USER REVIEWS =====
    public Page<ReviewDTO> getUserReviews(Long userId, Pageable pageable) {
        Page<Review> reviews = reviewRepository.findByRevieweeIdAndIsBookReviewFalse(userId, pageable);
        return reviews.map(this::convertToDTO);
    }

    // ===== GET AVERAGE RATING FOR BOOK =====
    public Double getAverageBookRating(Long bookId) {
        Double avg = reviewRepository.getAverageRatingForBook(bookId);
        return avg != null ? Math.round(avg * 10) / 10.0 : 0.0;
    }

    // ===== GET AVERAGE RATING FOR USER =====
    public Double getAverageUserRating(Long userId) {
        Double avg = reviewRepository.getAverageRatingForUser(userId);
        return avg != null ? Math.round(avg * 10) / 10.0 : 0.0;
    }

    // ===== GET REVIEW COUNTS =====
    public Long getBookReviewCount(Long bookId) {
        return reviewRepository.countByBookIdAndIsBookReviewTrue(bookId);
    }

    public Long getUserReviewCount(Long userId) {
        return reviewRepository.countByRevieweeIdAndIsBookReviewFalse(userId);
    }

    // ===== HELPER METHODS =====
    private ReviewDTO convertToDTO(Review review) {
        return ReviewDTO.builder()
                .id(review.getId())
                .book(review.getBook() != null ? bookService.convertToDTO(review.getBook()) : null)
                .reviewer(convertToUserSummary(review.getReviewer()))
                .reviewee(review.getReviewee() != null ? convertToUserSummary(review.getReviewee()) : null)
                .rating(review.getRating())
                .comment(review.getComment())
                .isBookReview(review.getIsBookReview())
                .createdAt(review.getCreatedAt())
                .build();
    }

    private UserSummaryDTO convertToUserSummary(User user) {
        return UserSummaryDTO.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .build();
    }
}