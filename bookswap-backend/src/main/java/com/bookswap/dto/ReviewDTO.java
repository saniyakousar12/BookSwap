package com.bookswap.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewDTO {
    private Long id;
    private BookDTO book;
    private UserSummaryDTO reviewer;
    private UserSummaryDTO reviewee;
    private Integer rating;
    private String comment;
    private Boolean isBookReview;
    private LocalDateTime createdAt;
}