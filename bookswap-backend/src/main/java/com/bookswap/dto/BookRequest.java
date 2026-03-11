package com.bookswap.dto;

import com.bookswap.enums.AvailabilityType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Author is required")
    private String author;

    private String description;

    @NotBlank(message = "ISBN is required")
    private String isbn;

    @NotBlank(message = "Category is required")
    private String category;

    @NotNull(message = "Publication year is required")
    private Integer publicationYear;

    @NotBlank(message = "Condition is required")
    private String condition; // NEW, LIKE_NEW, GOOD, FAIR

    private String language;

    private String imageUrl;

    @NotNull(message = "Availability type is required")
    private AvailabilityType availabilityType; // SWAP, BORROW, RENT, DONATE

    @Min(value = 0, message = "Rental price must be greater than or equal to 0")
    private Double rentalPricePerDay; // Only required if availabilityType is RENT

    private Boolean isAvailable;
}