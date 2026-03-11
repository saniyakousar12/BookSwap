package com.bookswap.service;

import com.bookswap.dto.*;
import com.bookswap.entity.*;
import com.bookswap.enums.NotificationType;
import com.bookswap.repository.NotificationRepository;
import com.bookswap.repository.UserRepository;
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
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final BookService bookService;

    // ===== CREATE NOTIFICATION =====
    public NotificationDTO createNotification(Long userId, NotificationType type, 
                                              String title, String message, 
                                              String actionUrl, Book book,
                                              Transaction transaction, User relatedUser) {
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Notification notification = Notification.builder()
                .user(user)
                .type(type)
                .title(title)
                .message(message)
                .isRead(false)
                .relatedBook(book)
                .relatedTransaction(transaction)
                .relatedUser(relatedUser)
                .actionUrl(actionUrl)
                .build();

        notification = notificationRepository.save(notification);
        log.info("Notification created for user {}: {}", userId, type);
        
        return convertToDTO(notification);
    }

    // ===== GET USER NOTIFICATIONS =====
    public Page<NotificationDTO> getUserNotifications(Long userId, Pageable pageable) {
        Page<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        return notifications.map(this::convertToDTO);
    }

    // ===== GET UNREAD COUNT =====
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    // ===== MARK AS READ =====
    public void markAsRead(Long notificationId) {
        notificationRepository.markAsRead(notificationId);
    }

    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsRead(userId);
    }

    // ===== REQUEST NOTIFICATIONS =====
    public void sendNewRequestNotification(Transaction transaction) {
        String title = "New Book Request";
        String message = String.format("%s %s requested your book '%s'",
            transaction.getRequester().getFirstName(),
            transaction.getRequester().getLastName(),
            transaction.getBook().getTitle());
        
        createNotification(
            transaction.getOwner().getId(),
            NotificationType.NEW_REQUEST,
            title,
            message,
            "/requests",
            transaction.getBook(),
            transaction,
            transaction.getRequester()
        );
    }

    public void sendRequestApprovedNotification(Transaction transaction) {
        String title = "Request Approved";
        String message = String.format("Your request for '%s' was approved",
            transaction.getBook().getTitle());
        
        createNotification(
            transaction.getRequester().getId(),
            NotificationType.REQUEST_APPROVED,
            title,
            message,
            "/requests",
            transaction.getBook(),
            transaction,
            transaction.getOwner()
        );
    }

    public void sendRequestRejectedNotification(Transaction transaction) {
        String title = "Request Rejected";
        String message = String.format("Your request for '%s' was rejected",
            transaction.getBook().getTitle());
        
        createNotification(
            transaction.getRequester().getId(),
            NotificationType.REQUEST_REJECTED,
            title,
            message,
            "/browse-books",
            transaction.getBook(),
            transaction,
            transaction.getOwner()
        );
    }

    // ===== TRANSACTION NOTIFICATIONS =====
    public void sendTransactionStartedNotification(Transaction transaction) {
        String title = "Transaction Started";
        String message = String.format("Your transaction for '%s' has started",
            transaction.getBook().getTitle());
        
        // Notify requester
        createNotification(
            transaction.getRequester().getId(),
            NotificationType.TRANSACTION_STARTED,
            title,
            message,
            "/requests",
            transaction.getBook(),
            transaction,
            transaction.getOwner()
        );

        // Notify owner
        createNotification(
            transaction.getOwner().getId(),
            NotificationType.TRANSACTION_STARTED,
            title,
            message,
            "/requests",
            transaction.getBook(),
            transaction,
            transaction.getRequester()
        );
    }

    public void sendTransactionCompletedNotification(Transaction transaction) {
        String title = "Transaction Completed";
        String message = String.format("Your transaction for '%s' has been completed",
            transaction.getBook().getTitle());
        
        // Notify requester
        createNotification(
            transaction.getRequester().getId(),
            NotificationType.TRANSACTION_COMPLETED,
            title,
            message,
            "/requests",
            transaction.getBook(),
            transaction,
            transaction.getOwner()
        );

        // Notify owner
        createNotification(
            transaction.getOwner().getId(),
            NotificationType.TRANSACTION_COMPLETED,
            title,
            message,
            "/requests",
            transaction.getBook(),
            transaction,
            transaction.getRequester()
        );
    }

    // ===== REVIEW NOTIFICATIONS =====
    public void sendNewReviewNotification(Review review) {
        String title = "New Review";
        String message = String.format("%s %s reviewed your book '%s'",
            review.getReviewer().getFirstName(),
            review.getReviewer().getLastName(),
            review.getBook().getTitle());
        
        createNotification(
            review.getBook().getOwner().getId(),
            NotificationType.NEW_REVIEW,
            title,
            message,
            "/book/" + review.getBook().getId(),
            review.getBook(),
            null,
            review.getReviewer()
        );
    }

    public void sendUserRatingNotification(Review review) {
        String title = "New Rating";
        String message = String.format("%s %s rated you %d stars",
            review.getReviewer().getFirstName(),
            review.getReviewer().getLastName(),
            review.getRating());
        
        createNotification(
            review.getReviewee().getId(),
            NotificationType.NEW_REVIEW,
            title,
            message,
            "/profile/" + review.getReviewer().getId(),
            null,
            null,
            review.getReviewer()
        );
    }

    // ===== HELPER METHODS =====
    private NotificationDTO convertToDTO(Notification notification) {
        return NotificationDTO.builder()
                .id(notification.getId())
                .type(notification.getType())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .isRead(notification.getIsRead())
                .relatedBook(notification.getRelatedBook() != null ? 
                    convertToBookSummary(notification.getRelatedBook()) : null)  // FIXED
                .relatedTransaction(notification.getRelatedTransaction() != null ?
                    convertToTransactionSummary(notification.getRelatedTransaction()) : null)
                .relatedUser(notification.getRelatedUser() != null ?
                    convertToUserSummary(notification.getRelatedUser()) : null)
                .actionUrl(notification.getActionUrl())
                .createdAt(notification.getCreatedAt())
                .build();
    }

    // NEW METHOD - Convert Book to BookSummaryDTO
    private BookSummaryDTO convertToBookSummary(Book book) {
        if (book == null) return null;
        
        return BookSummaryDTO.builder()
                .id(book.getId())
                .title(book.getTitle())
                .author(book.getAuthor())
                .imageUrl(book.getImageUrl())
                .build();
    }

    private TransactionSummaryDTO convertToTransactionSummary(Transaction transaction) {
        if (transaction == null) return null;
        
        return TransactionSummaryDTO.builder()
                .id(transaction.getId())
                .status(transaction.getStatus())
                .type(transaction.getTransactionType())
                .book(transaction.getBook() != null ? 
                    convertToBookSummary(transaction.getBook()) : null)  // Use BookSummary here too
                .requesterName(transaction.getRequester() != null ? 
                    transaction.getRequester().getFirstName() + " " + transaction.getRequester().getLastName() : null)
                .ownerName(transaction.getOwner() != null ? 
                    transaction.getOwner().getFirstName() + " " + transaction.getOwner().getLastName() : null)
                .build();
    }

    private UserSummaryDTO convertToUserSummary(User user) {
        if (user == null) return null;
        
        return UserSummaryDTO.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .build();
    }
}