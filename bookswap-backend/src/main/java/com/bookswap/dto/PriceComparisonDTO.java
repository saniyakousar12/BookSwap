package com.bookswap.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PriceComparisonDTO {
    private Long bookId;
    private String title;
    private String author;
    private Double rentalPricePerDay;
    private String ownerName;
    private Double ownerRating;
    private String location;
    private Double distance; // if location provided
}