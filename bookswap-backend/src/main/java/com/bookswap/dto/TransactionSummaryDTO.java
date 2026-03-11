package com.bookswap.dto;

import com.bookswap.enums.TransactionStatus;
import com.bookswap.enums.TransactionType;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionSummaryDTO {
    private Long id;
    private TransactionStatus status;
    private TransactionType type;
    private BookSummaryDTO book;
    private String requesterName;
    private String ownerName;
}