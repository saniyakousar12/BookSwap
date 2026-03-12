package com.bookswap.dto;

import com.bookswap.enums.BookCategory;
import com.bookswap.enums.AvailabilityType;
import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SearchRequestDTO {
    // Text search fields
    private String keyword;
    private String title;
    private String author;
    private String isbn;
    private String publisher;
    
    // Filter fields
    private BookCategory category;
    private String condition; // NEW, LIKE_NEW, GOOD, FAIR
    private AvailabilityType availabilityType;
    
    // Price filter for rent
    private Double minPrice;
    private Double maxPrice;
    
    // Location filter
    private Double latitude;
    private Double longitude;
    private Double maxDistance; // in kilometers
    
    // Availability
    private Boolean availableOnly;
    private LocalDateTime availableFrom;
    private LocalDateTime availableUntil;
    
    // Pagination
    private int page = 0;
    private int size = 20;
    private String sortBy = "createdAt";
    private String sortDirection = "DESC";
}