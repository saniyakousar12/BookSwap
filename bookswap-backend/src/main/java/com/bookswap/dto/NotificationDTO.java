package com.bookswap.dto;

import com.bookswap.enums.NotificationType;
import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationDTO {
    private Long id;
    private NotificationType type;
    private String title;
    private String message;
    private Boolean isRead;
    private BookSummaryDTO relatedBook;           // Fixed: Using BookSummaryDTO
    private TransactionSummaryDTO relatedTransaction; // Fixed: Using TransactionSummaryDTO
    private UserSummaryDTO relatedUser;
    private String actionUrl;
    private LocalDateTime createdAt;
}