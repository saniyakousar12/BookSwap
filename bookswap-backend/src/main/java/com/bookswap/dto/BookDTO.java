package com.bookswap.dto;

import com.bookswap.enums.BookCategory;
import com.bookswap.enums.AvailabilityType;
import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookDTO {

    private Long id;
    private String title;
    private String author;
    private String description;
    private String isbn;
    private BookCategory category;
    private Integer publicationYear;
    private String condition;
    private String language;
    private String imageUrl;
    private AvailabilityType availabilityType;
    private Double rentalPricePerDay;
    private Long ownerId;
    private String ownerName;
    private Boolean isAvailable;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}