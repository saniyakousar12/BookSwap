package com.bookswap.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SearchResponseDTO {
    private List<BookDTO> books;
    private long totalElements;
    private int totalPages;
    private int currentPage;
    private int pageSize;
    private boolean hasNext;
    private boolean hasPrevious;
    
    // Price comparison
    private PriceRangeDTO priceRange;
    private List<PriceComparisonDTO> priceComparisons;
    
    // Availability calendar
    private List<AvailabilitySlotDTO> availabilitySlots;
}