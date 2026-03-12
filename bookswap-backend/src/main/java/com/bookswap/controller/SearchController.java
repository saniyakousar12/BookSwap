package com.bookswap.controller;

import com.bookswap.dto.*;
import com.bookswap.enums.BookCategory;
import com.bookswap.enums.AvailabilityType;
import com.bookswap.service.SearchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class SearchController {

    private final SearchService searchService;

    @PostMapping("/advanced")
    public ResponseEntity<SearchResponseDTO> advancedSearch(@RequestBody SearchRequestDTO request) {
        log.info("Advanced search request: {}", request);
        SearchResponseDTO response = searchService.advancedSearch(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/price-range")
    public ResponseEntity<PriceRangeDTO> getPriceRange() {
        return ResponseEntity.ok(searchService.getPriceRange());
    }

    @GetMapping("/compare-prices")
    public ResponseEntity<List<PriceComparisonDTO>> comparePrices(
            @RequestParam BookCategory category,
            @RequestParam(required = false) Double maxDistance) {
        return ResponseEntity.ok(searchService.comparePrices(category, maxDistance));
    }

    @GetMapping("/availability/{bookId}")
    public ResponseEntity<AvailabilitySlotDTO> getBookAvailability(@PathVariable Long bookId) {
        return ResponseEntity.ok(searchService.getBookAvailability(bookId));
    }

    // Simple text search endpoint (backward compatible)
    @GetMapping("/simple")
    public ResponseEntity<SearchResponseDTO> simpleSearch(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        SearchRequestDTO request = SearchRequestDTO.builder()
                .keyword(query)
                .page(page)
                .size(size)
                .build();
        
        return ResponseEntity.ok(searchService.advancedSearch(request));
    }
}