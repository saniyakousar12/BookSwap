package com.bookswap.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookSummaryDTO {
    private Long id;
    private String title;
    private String author;
    private String imageUrl;
}