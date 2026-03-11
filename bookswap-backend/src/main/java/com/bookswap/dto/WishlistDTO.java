package com.bookswap.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WishlistDTO {

    private Long id;
    private BookDTO book;
    private LocalDateTime addedAt;
}