package com.bookswap.dto;

import com.bookswap.enums.TransactionType;
import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionRequestDTO {
    private Long bookId;
    private TransactionType transactionType;
    private String requestMessage;
    private LocalDateTime startDate; // For borrow/rent - when user wants to start
    private LocalDateTime endDate; // For borrow/rent - expected return date
    private Integer rentalDays; // For rent - number of days
}