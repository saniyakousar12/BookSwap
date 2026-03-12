package com.bookswap.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PriceRangeDTO {
    private Double minPrice;
    private Double maxPrice;
    private Double averagePrice;
    private Long bookCount;
}