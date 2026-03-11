package com.bookswap.dto;

import com.bookswap.enums.TransactionStatus;
import com.bookswap.enums.TransactionType;
import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionDTO {
    private Long id;
    private BookDTO book;
    private UserSummaryDTO requester;
    private UserSummaryDTO owner;
    private TransactionType transactionType;
    private TransactionStatus status;
    private String requestMessage;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private LocalDateTime actualReturnDate;
    private Double rentalPricePerDay;
    private Double totalAmount;
    private Boolean paymentCompleted;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}