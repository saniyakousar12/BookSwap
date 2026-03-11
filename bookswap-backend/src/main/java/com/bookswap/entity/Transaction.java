package com.bookswap.entity;

import com.bookswap.enums.TransactionStatus;
import com.bookswap.enums.TransactionType;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requester_id", nullable = false)
    private User requester; // User who wants the book

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner; // User who owns the book

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionType transactionType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionStatus status = TransactionStatus.PENDING;

    @Column(name = "request_message", length = 500)
    private String requestMessage; // Optional message from requester

    @Column(name = "start_date")
    private LocalDateTime startDate; // When transaction becomes active

    @Column(name = "end_date")
    private LocalDateTime endDate; // For borrow/rent - expected return date

    @Column(name = "actual_return_date")
    private LocalDateTime actualReturnDate; // When book was actually returned

    @Column(name = "rental_price_per_day")
    private Double rentalPricePerDay; // Snapshot of price at time of request

    @Column(name = "total_amount")
    private Double totalAmount; // Calculated total for rent

    @Column(name = "payment_status")
    private Boolean paymentCompleted = false; // For rent transactions

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}