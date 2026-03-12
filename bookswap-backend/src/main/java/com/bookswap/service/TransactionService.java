package com.bookswap.service;

import com.bookswap.dto.*;
import com.bookswap.entity.*;
import com.bookswap.enums.TransactionStatus;
import com.bookswap.enums.TransactionType;
import com.bookswap.enums.AvailabilityType;
import com.bookswap.repository.BookRepository;
import com.bookswap.repository.TransactionRepository;
import com.bookswap.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final BookService bookService;
    private final NotificationService notificationService;

    // ===== REQUEST BOOK =====
    public TransactionDTO requestBook(TransactionRequestDTO request, Long requesterId) {
        // Validate book exists and is available
        Book book = bookRepository.findById(request.getBookId())
                .orElseThrow(() -> new RuntimeException("Book not found"));
        
        if (!book.getIsAvailable()) {
            throw new RuntimeException("Book is not available");
        }
        
        // Check if user is trying to request their own book
        if (book.getOwner().getId().equals(requesterId)) {
            throw new RuntimeException("You cannot request your own book");
        }
        
        // Check if there's already a pending/active transaction
        List<TransactionStatus> activeStatuses = Arrays.asList(
            TransactionStatus.PENDING, 
            TransactionStatus.APPROVED, 
            TransactionStatus.ACTIVE
        );
        
        if (transactionRepository.existsByBookIdAndStatusIn(book.getId(), activeStatuses)) {
            throw new RuntimeException("Book already has an active request");
        }
        
        // Validate transaction type matches book's availability type
        validateTransactionType(book, request.getTransactionType());
        
        // Create transaction
        User requester = userRepository.findById(requesterId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Transaction transaction = Transaction.builder()
                .book(book)
                .requester(requester)
                .owner(book.getOwner())
                .transactionType(request.getTransactionType())
                .status(TransactionStatus.PENDING)
                .requestMessage(request.getRequestMessage())
                .startDate(LocalDateTime.now())
                .build();

        // Handle rent-specific fields
        if (request.getTransactionType() == TransactionType.RENT) {
            if (request.getRentalDays() == null || request.getRentalDays() <= 0) {
                throw new RuntimeException("Rental days must be specified");
            }
            transaction.setEndDate(LocalDateTime.now().plusDays(request.getRentalDays()));
            transaction.setRentalPricePerDay(book.getRentalPricePerDay());
            transaction.setTotalAmount(book.getRentalPricePerDay() * request.getRentalDays());
        }
        
        transaction = transactionRepository.save(transaction);
        log.info("Book request created: {} for book {} by user {}", 
                 transaction.getId(), book.getId(), requesterId);
        
        // Send notification to book owner
        try {
            notificationService.sendNewRequestNotification(transaction);
        } catch (Exception e) {
            log.error("Failed to send notification: {}", e.getMessage());
        }
        
        return convertToDTO(transaction);
    }

    // ===== APPROVE REQUEST =====
    public TransactionDTO approveRequest(Long transactionId, Long ownerId) {
        Transaction transaction = getTransactionAndValidateOwner(transactionId, ownerId);
        
        if (transaction.getStatus() != TransactionStatus.PENDING) {
            throw new RuntimeException("Only pending requests can be approved");
        }
        
        transaction.setStatus(TransactionStatus.APPROVED);
        transaction = transactionRepository.save(transaction);
        
        log.info("Request approved: {} by owner {}", transactionId, ownerId);
        
        // Send notification to requester
        try {
            notificationService.sendRequestApprovedNotification(transaction);
        } catch (Exception e) {
            log.error("Failed to send notification: {}", e.getMessage());
        }
        
        return convertToDTO(transaction);
    }

    // ===== REJECT REQUEST =====
    public TransactionDTO rejectRequest(Long transactionId, Long ownerId) {
        Transaction transaction = getTransactionAndValidateOwner(transactionId, ownerId);
        
        if (transaction.getStatus() != TransactionStatus.PENDING) {
            throw new RuntimeException("Only pending requests can be rejected");
        }
        
        transaction.setStatus(TransactionStatus.REJECTED);
        transaction = transactionRepository.save(transaction);
        
        log.info("Request rejected: {} by owner {}", transactionId, ownerId);
        
        // Send notification to requester
        try {
            notificationService.sendRequestRejectedNotification(transaction);
        } catch (Exception e) {
            log.error("Failed to send notification: {}", e.getMessage());
        }
        
        return convertToDTO(transaction);
    }

    // ===== START TRANSACTION (Mark as ACTIVE) =====
    public TransactionDTO startTransaction(Long transactionId, Long userId) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));
        
        // Validate user is either requester or owner
        if (!transaction.getRequester().getId().equals(userId) && 
            !transaction.getOwner().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        
        if (transaction.getStatus() != TransactionStatus.APPROVED) {
            throw new RuntimeException("Only approved transactions can be started");
        }
        
        // Update book availability
        Book book = transaction.getBook();
        book.setIsAvailable(false);
        bookRepository.save(book);
        
        transaction.setStatus(TransactionStatus.ACTIVE);
        transaction.setStartDate(LocalDateTime.now());
        transaction = transactionRepository.save(transaction);
        
        log.info("Transaction started: {} by user {}", transactionId, userId);
        
        return convertToDTO(transaction);
    }

    // ===== COMPLETE TRANSACTION =====
    public TransactionDTO completeTransaction(Long transactionId, Long userId) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));
        
        // Validate user is either requester or owner
        if (!transaction.getRequester().getId().equals(userId) && 
            !transaction.getOwner().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        
        if (transaction.getStatus() != TransactionStatus.ACTIVE) {
            throw new RuntimeException("Only active transactions can be completed");
        }
        
        // Update book availability
        Book book = transaction.getBook();
        book.setIsAvailable(true);
        bookRepository.save(book);
        
        transaction.setStatus(TransactionStatus.COMPLETED);
        transaction.setActualReturnDate(LocalDateTime.now());
        transaction = transactionRepository.save(transaction);
        
        log.info("Transaction completed: {} by user {}", transactionId, userId);
        
        return convertToDTO(transaction);
    }

    // ===== CANCEL REQUEST =====
    public TransactionDTO cancelRequest(Long transactionId, Long requesterId) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));
        
        if (!transaction.getRequester().getId().equals(requesterId)) {
            throw new RuntimeException("Only requester can cancel their requests");
        }
        
        if (transaction.getStatus() != TransactionStatus.PENDING && 
            transaction.getStatus() != TransactionStatus.APPROVED) {
            throw new RuntimeException("Only pending or approved requests can be cancelled");
        }
        
        transaction.setStatus(TransactionStatus.CANCELLED);
        transaction = transactionRepository.save(transaction);
        
        log.info("Request cancelled: {} by requester {}", transactionId, requesterId);
        
        return convertToDTO(transaction);
    }

    // ===== GET USER TRANSACTIONS (as requester) =====
    public Page<TransactionDTO> getUserRequests(Long userId, Pageable pageable) {
        Page<Transaction> transactions = transactionRepository.findByRequesterId(userId, pageable);
        return transactions.map(this::convertToDTO);
    }

    // ===== GET USER TRANSACTIONS (as owner) =====
    public Page<TransactionDTO> getUserReceivedRequests(Long userId, Pageable pageable) {
        Page<Transaction> transactions = transactionRepository.findByOwnerId(userId, pageable);
        return transactions.map(this::convertToDTO);
    }

    // ===== GET PENDING REQUESTS FOR OWNER =====
    public Page<TransactionDTO> getPendingRequestsForOwner(Long ownerId, Pageable pageable) {
        Page<Transaction> transactions = transactionRepository.findByOwnerIdAndStatus(
            ownerId, TransactionStatus.PENDING, pageable);
        return transactions.map(this::convertToDTO);
    }

    // ===== GET SINGLE TRANSACTION =====
    public TransactionDTO getTransaction(Long transactionId, Long userId) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));
        
        // Validate user is involved in transaction
        if (!transaction.getRequester().getId().equals(userId) && 
            !transaction.getOwner().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        
        return convertToDTO(transaction);
    }

    // ===== HELPER METHODS =====
    private Transaction getTransactionAndValidateOwner(Long transactionId, Long ownerId) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));
        
        if (!transaction.getOwner().getId().equals(ownerId)) {
            throw new RuntimeException("Only book owner can perform this action");
        }
        
        return transaction;
    }

    private void validateTransactionType(Book book, TransactionType requestedType) {
        AvailabilityType bookType = book.getAvailabilityType();
        
        switch (requestedType) {
            case SWAP:
                if (bookType != AvailabilityType.SWAP) {
                    throw new RuntimeException("Book is not available for swap");
                }
                break;
            case BORROW:
                if (bookType != AvailabilityType.BORROW) {
                    throw new RuntimeException("Book is not available for borrowing");
                }
                break;
            case RENT:
                if (bookType != AvailabilityType.RENT) {
                    throw new RuntimeException("Book is not available for rent");
                }
                if (book.getRentalPricePerDay() == null || book.getRentalPricePerDay() <= 0) {
                    throw new RuntimeException("Rental price not set for this book");
                }
                break;
            case DONATE:
                if (bookType != AvailabilityType.DONATE) {
                    throw new RuntimeException("Book is not available for donation");
                }
                break;
        }
    }

    private TransactionDTO convertToDTO(Transaction transaction) {
        return TransactionDTO.builder()
                .id(transaction.getId())
                .book(bookService.convertToDTO(transaction.getBook()))
                .requester(convertToUserSummary(transaction.getRequester()))
                .owner(convertToUserSummary(transaction.getOwner()))
                .transactionType(transaction.getTransactionType())
                .status(transaction.getStatus())
                .requestMessage(transaction.getRequestMessage())
                .startDate(transaction.getStartDate())
                .endDate(transaction.getEndDate())
                .actualReturnDate(transaction.getActualReturnDate())
                .rentalPricePerDay(transaction.getRentalPricePerDay())
                .totalAmount(transaction.getTotalAmount())
                .paymentCompleted(transaction.getPaymentCompleted())
                .createdAt(transaction.getCreatedAt())
                .updatedAt(transaction.getUpdatedAt())
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