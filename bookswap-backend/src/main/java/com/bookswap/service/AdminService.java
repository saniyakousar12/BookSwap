package com.bookswap.service;

import com.bookswap.dto.*;
import com.bookswap.entity.*;
import com.bookswap.enums.TransactionStatus;
import com.bookswap.enums.TransactionType;
import com.bookswap.enums.UserRole;
import com.bookswap.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AdminService {

    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    private final TransactionRepository transactionRepository;
    private final WishlistRepository wishlistRepository;
    private final AuthService authService;
    private final BookService bookService;

    // ===== DASHBOARD STATS =====
    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
        // Basic counts
        stats.put("totalUsers", userRepository.count());
        stats.put("totalBooks", bookRepository.count());
        stats.put("totalTransactions", transactionRepository.count());
        
        // Revenue from completed rent transactions
        Double totalRevenue = transactionRepository.sumTotalAmountByStatus(TransactionStatus.COMPLETED);
        stats.put("totalRevenue", totalRevenue != null ? totalRevenue : 0.0);
        
        // Active transactions
        List<TransactionStatus> activeStatuses = List.of(
            TransactionStatus.PENDING, 
            TransactionStatus.APPROVED, 
            TransactionStatus.ACTIVE
        );
        stats.put("activeTransactions", transactionRepository.countByStatusIn(activeStatuses));
        stats.put("pendingRequests", transactionRepository.countByStatus(TransactionStatus.PENDING));
        
        // Books by type
        Map<String, Long> booksByType = new HashMap<>();
        booksByType.put("SWAP", bookRepository.countByAvailabilityType(com.bookswap.enums.AvailabilityType.SWAP));
        booksByType.put("BORROW", bookRepository.countByAvailabilityType(com.bookswap.enums.AvailabilityType.BORROW));
        booksByType.put("RENT", bookRepository.countByAvailabilityType(com.bookswap.enums.AvailabilityType.RENT));
        booksByType.put("DONATE", bookRepository.countByAvailabilityType(com.bookswap.enums.AvailabilityType.DONATE));
        stats.put("booksByType", booksByType);
        
        // Transactions by status
        Map<String, Long> transactionsByStatus = new HashMap<>();
        transactionsByStatus.put("PENDING", transactionRepository.countByStatus(TransactionStatus.PENDING));
        transactionsByStatus.put("APPROVED", transactionRepository.countByStatus(TransactionStatus.APPROVED));
        transactionsByStatus.put("ACTIVE", transactionRepository.countByStatus(TransactionStatus.ACTIVE));
        transactionsByStatus.put("COMPLETED", transactionRepository.countByStatus(TransactionStatus.COMPLETED));
        transactionsByStatus.put("REJECTED", transactionRepository.countByStatus(TransactionStatus.REJECTED));
        transactionsByStatus.put("CANCELLED", transactionRepository.countByStatus(TransactionStatus.CANCELLED));
        stats.put("transactionsByStatus", transactionsByStatus);
        
        // Recent users
        stats.put("recentUsers", userRepository.findTop5ByOrderByCreatedAtDesc()
                .stream()
                .map(this::convertToUserSummary)
                .collect(Collectors.toList()));
        
        // Recent transactions
        stats.put("recentTransactions", transactionRepository.findTop10ByOrderByCreatedAtDesc()
                .stream()
                .map(this::convertToTransactionDTO)
                .collect(Collectors.toList()));
        
        // Popular categories
        stats.put("popularCategories", bookRepository.findPopularCategories());
        
        return stats;
    }

    // ===== USERS MANAGEMENT =====
    public Page<UserDTO> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable)
                .map(this::convertToUserDTO);
    }

    public UserDTO toggleUserStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setIsActive(!user.getIsActive());
        user = userRepository.save(user);
        log.info("User {} status toggled to {}", userId, user.getIsActive());
        
        return convertToUserDTO(user);
    }

    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Check if user has active transactions
        List<TransactionStatus> activeStatuses = List.of(
            TransactionStatus.PENDING, 
            TransactionStatus.APPROVED, 
            TransactionStatus.ACTIVE
        );
        long activeTransactions = transactionRepository.countByOwnerIdAndStatusIn(userId, activeStatuses) +
                                  transactionRepository.countByRequesterIdAndStatusIn(userId, activeStatuses);
        
        if (activeTransactions > 0) {
            throw new RuntimeException("Cannot delete user with active transactions");
        }
        
        // Delete user's wishlist
        wishlistRepository.deleteByUserId(userId);
        
        // Delete user's books (will cascade to transactions)
        bookRepository.deleteByOwnerId(userId);
        
        // Delete user
        userRepository.deleteById(userId);
        log.info("User {} deleted", userId);
    }

    // ===== BOOKS MANAGEMENT =====
    public Page<BookDTO> getAllBooks(Pageable pageable) {
        return bookRepository.findAll(pageable)
                .map(bookService::convertToDTO);
    }

    public void deleteBook(Long bookId) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found"));
        
        // Check if book has active transactions
        List<TransactionStatus> activeStatuses = List.of(
            TransactionStatus.PENDING, 
            TransactionStatus.APPROVED, 
            TransactionStatus.ACTIVE
        );
        long activeTransactions = transactionRepository.countByBookIdAndStatusIn(bookId, activeStatuses);
        
        if (activeTransactions > 0) {
            throw new RuntimeException("Cannot delete book with active transactions");
        }
        
        // Delete from wishlists first
        wishlistRepository.deleteByBookId(bookId);
        
        // Delete the book
        bookRepository.deleteById(bookId);
        log.info("Book {} deleted", bookId);
    }

    // ===== TRANSACTIONS MANAGEMENT =====
    public Page<TransactionDTO> getAllTransactions(Pageable pageable) {
        return transactionRepository.findAll(pageable)
                .map(this::convertToTransactionDTO);
    }

    // ===== REVENUE STATS =====
    public Map<String, Object> getRevenueStats(String period) {
        Map<String, Object> stats = new HashMap<>();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startDate;
        
        switch (period.toLowerCase()) {
            case "week":
                startDate = now.minusWeeks(1);
                break;
            case "month":
                startDate = now.minusMonths(1);
                break;
            case "year":
                startDate = now.minusYears(1);
                break;
            default:
                startDate = now.minusMonths(1);
        }
        
        // Revenue by day/week/month
        List<Object[]> revenueByPeriod = transactionRepository.getRevenueGroupedByPeriod(
            TransactionStatus.COMPLETED, startDate, now);
        stats.put("revenueByPeriod", revenueByPeriod);
        
        // Total revenue in period
        Double periodRevenue = transactionRepository.sumTotalAmountByStatusAndCreatedAtBetween(
            TransactionStatus.COMPLETED, startDate, now);
        stats.put("periodRevenue", periodRevenue != null ? periodRevenue : 0.0);
        
        // Revenue by transaction type
        Map<String, Double> revenueByType = new HashMap<>();
        revenueByType.put("RENT", transactionRepository.sumTotalAmountByTransactionTypeAndStatus(
            TransactionType.RENT, TransactionStatus.COMPLETED));
        stats.put("revenueByType", revenueByType);
        
        return stats;
    }

    // ===== USER STATS =====
    public Map<String, Object> getUserStats(Long userId) {
        Map<String, Object> stats = new HashMap<>();
        
        stats.put("totalBooks", bookRepository.countByOwnerId(userId));
        stats.put("availableBooks", bookRepository.countByOwnerIdAndIsAvailableTrue(userId));
        stats.put("totalTransactions", transactionRepository.countByOwnerId(userId) + 
                                       transactionRepository.countByRequesterId(userId));
        
        stats.put("pendingRequests", transactionRepository.countByRequesterIdAndStatus(
            userId, TransactionStatus.PENDING));
        stats.put("activeTransactions", transactionRepository.countByRequesterIdAndStatusIn(userId, 
            List.of(TransactionStatus.APPROVED, TransactionStatus.ACTIVE)));
        
        stats.put("wishlistCount", wishlistRepository.countByUserId(userId));
        
        return stats;
    }

    // ===== BOOK STATS =====
    public Map<String, Object> getBookStats(Long bookId) {
        Map<String, Object> stats = new HashMap<>();
        
        stats.put("totalRequests", transactionRepository.countByBookId(bookId));
        stats.put("completedTransactions", transactionRepository.countByBookIdAndStatus(
            bookId, TransactionStatus.COMPLETED));
        stats.put("activeRequests", transactionRepository.countByBookIdAndStatusIn(bookId,
            List.of(TransactionStatus.PENDING, TransactionStatus.APPROVED)));
        
        stats.put("inWishlists", wishlistRepository.countByBookId(bookId));
        
        return stats;
    }

    // ===== HELPER METHODS =====
    private UserDTO convertToUserDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole())
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
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

    private TransactionDTO convertToTransactionDTO(Transaction transaction) {
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
}