package com.bookswap.repository;

import com.bookswap.entity.Transaction;
import com.bookswap.enums.TransactionStatus;
import com.bookswap.enums.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    
    // Find by requester (user who requested)
    Page<Transaction> findByRequesterId(Long userId, Pageable pageable);
    
    // Find by owner (user who owns the book)
    Page<Transaction> findByOwnerId(Long userId, Pageable pageable);
    
    // Find by book
    List<Transaction> findByBookId(Long bookId);
    
    // Check if there's an active/pending transaction for a book
    boolean existsByBookIdAndStatusIn(Long bookId, List<TransactionStatus> statuses);
    
    // Find active transactions for a user (as owner or requester)
    @Query("SELECT t FROM Transaction t WHERE " +
           "(t.requester.id = :userId OR t.owner.id = :userId) AND " +
           "t.status IN :statuses")
    List<Transaction> findUserActiveTransactions(@Param("userId") Long userId, 
                                                 @Param("statuses") List<TransactionStatus> statuses);
    
    // Find by status
    Page<Transaction> findByStatus(TransactionStatus status, Pageable pageable);
    
    // Find pending requests for owner
    Page<Transaction> findByOwnerIdAndStatus(Long ownerId, TransactionStatus status, Pageable pageable);
    
    // ===== NEW METHODS FOR ADMIN DASHBOARD =====
    
    // Count by status
    long countByStatus(TransactionStatus status);
    
    // Count by status in list
    long countByStatusIn(List<TransactionStatus> statuses);
    
    // Find by transaction type and status
    List<Transaction> findByTransactionTypeAndStatus(TransactionType type, TransactionStatus status);
    
    // Count by owner ID
    long countByOwnerId(Long ownerId);
    
    // Count by requester ID
    long countByRequesterId(Long userId);
    
    // Count by owner ID and status
    long countByOwnerIdAndStatus(Long ownerId, TransactionStatus status);
    
    // Count by requester ID and status
    long countByRequesterIdAndStatus(Long userId, TransactionStatus status);
    
    // Count by owner ID and status in list
    long countByOwnerIdAndStatusIn(Long ownerId, List<TransactionStatus> statuses);
    
    // Count by requester ID and status in list
    long countByRequesterIdAndStatusIn(Long userId, List<TransactionStatus> statuses);
    
    // Count by book ID
    long countByBookId(Long bookId);
    
    // Count by book ID and status
    long countByBookIdAndStatus(Long bookId, TransactionStatus status);
    
    // Count by book ID and status in list
    long countByBookIdAndStatusIn(Long bookId, List<TransactionStatus> statuses);
    
    // Count by created at between
    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    
    // Find by transaction type, status, and created at between
    List<Transaction> findByTransactionTypeAndStatusAndCreatedAtBetween(
        TransactionType type, TransactionStatus status, LocalDateTime start, LocalDateTime end);
    
    // Find top 10 by order by created at desc
    List<Transaction> findTop10ByOrderByCreatedAtDesc();
    
    // Sum total amount by status
    @Query("SELECT SUM(t.totalAmount) FROM Transaction t WHERE t.status = :status")
    Double sumTotalAmountByStatus(@Param("status") TransactionStatus status);
    
    // Sum total amount by status and created at between
    @Query("SELECT SUM(t.totalAmount) FROM Transaction t WHERE t.status = :status AND t.createdAt BETWEEN :start AND :end")
    Double sumTotalAmountByStatusAndCreatedAtBetween(
        @Param("status") TransactionStatus status,
        @Param("start") LocalDateTime start,
        @Param("end") LocalDateTime end);
    
    // Sum total amount by transaction type and status
    @Query("SELECT SUM(t.totalAmount) FROM Transaction t WHERE t.transactionType = :type AND t.status = :status")
    Double sumTotalAmountByTransactionTypeAndStatus(
        @Param("type") TransactionType type,
        @Param("status") TransactionStatus status);
    
    // Get revenue grouped by period
    @Query("SELECT FUNCTION('DATE', t.createdAt), SUM(t.totalAmount) FROM Transaction t " +
           "WHERE t.status = :status AND t.createdAt BETWEEN :start AND :end " +
           "GROUP BY FUNCTION('DATE', t.createdAt)")
    List<Object[]> getRevenueGroupedByPeriod(
        @Param("status") TransactionStatus status,
        @Param("start") LocalDateTime start,
        @Param("end") LocalDateTime end);
}