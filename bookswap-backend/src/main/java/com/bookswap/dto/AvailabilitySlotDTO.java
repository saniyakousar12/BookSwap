package com.bookswap.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AvailabilitySlotDTO {
    private Long bookId;
    private String title;
    private LocalDateTime availableFrom;
    private LocalDateTime availableUntil;
    private String status; // AVAILABLE, PENDING, BOOKED
}