package com.bookswap.service;

import com.bookswap.dto.*;
import com.bookswap.entity.Book;
import com.bookswap.enums.BookCategory;
import com.bookswap.repository.SearchRepository;
import com.bookswap.specification.SearchSpecification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SearchService {

    private final SearchRepository searchRepository;
    private final BookService bookService;

    public SearchResponseDTO advancedSearch(SearchRequestDTO request) {
        log.info("Performing advanced search with filters: {}", request);
        
        // Build specification from filters
        Specification<Book> spec = SearchSpecification.withFilters(
            request.getKeyword(),
            request.getTitle(),
            request.getAuthor(),
            request.getIsbn(),
            request.getPublisher(),
            request.getCategory(),
            request.getCondition(),
            request.getAvailabilityType(),
            request.getMinPrice(),
            request.getMaxPrice(),
            request.getAvailableOnly(),
            request.getAvailableFrom(),
            request.getAvailableUntil(),
            request.getLatitude(),
            request.getLongitude(),
            request.getMaxDistance()
        );
        
        // Create pageable
        Sort sort = Sort.by(Sort.Direction.fromString(request.getSortDirection()), request.getSortBy());
        Pageable pageable = PageRequest.of(request.getPage(), request.getSize(), sort);
        
        // Execute search
        Page<Book> bookPage = searchRepository.findAll(spec, pageable);
        
        // Build response
        SearchResponseDTO response = new SearchResponseDTO();
        response.setBooks(bookPage.getContent().stream()
                .map(bookService::convertToDTO)
                .collect(Collectors.toList()));
        response.setTotalElements(bookPage.getTotalElements());
        response.setTotalPages(bookPage.getTotalPages());
        response.setCurrentPage(bookPage.getNumber());
        response.setPageSize(bookPage.getSize());
        response.setHasNext(bookPage.hasNext());
        response.setHasPrevious(bookPage.hasPrevious());
        
        // Add price range for rent books
        if (request.getAvailabilityType() != null && 
            request.getAvailabilityType() == com.bookswap.enums.AvailabilityType.RENT) {
            PriceRangeDTO priceRange = searchRepository.getRentalPriceRange();
            response.setPriceRange(priceRange);
            log.info("Added price range: min={}, max={}, avg={}", 
                priceRange.getMinPrice(), priceRange.getMaxPrice(), priceRange.getAveragePrice());
        }
        
        // Add price comparisons if category specified
        if (request.getCategory() != null) {
            try {
                List<PriceComparisonDTO> comparisons = searchRepository.compareRentalPrices(
                        request.getCategory(),
                        request.getMaxDistance() != null ? request.getMaxDistance() : 50.0, // Default 50km
                        PageRequest.of(0, 10)
                );
                response.setPriceComparisons(comparisons);
                log.info("Found {} price comparisons for category {}", comparisons.size(), request.getCategory());
            } catch (Exception e) {
                log.error("Error fetching price comparisons: {}", e.getMessage());
            }
        }
        
        // Add availability slots if date range specified
        if (request.getAvailableFrom() != null && request.getAvailableUntil() != null) {
            try {
                LocalDateTime now = LocalDateTime.now();
                List<AvailabilitySlotDTO> slots = searchRepository.getUpcomingAvailability(
                        now.plusDays(30),
                        now,
                        PageRequest.of(0, 10)
                );
                response.setAvailabilitySlots(slots);
                log.info("Found {} upcoming availability slots", slots.size());
            } catch (Exception e) {
                log.error("Error fetching availability slots: {}", e.getMessage());
            }
        }
        
        return response;
    }
    
    public PriceRangeDTO getPriceRange() {
        log.info("Fetching rental price range");
        return searchRepository.getRentalPriceRange();
    }
    
    public List<PriceComparisonDTO> comparePrices(BookCategory category, Double maxDistance) {
        log.info("Comparing prices for category: {}, max distance: {}", category, maxDistance);
        Double distance = maxDistance != null ? maxDistance : 50.0; // Default 50km
        return searchRepository.compareRentalPrices(category, distance, PageRequest.of(0, 20));
    }
    
    public AvailabilitySlotDTO getBookAvailability(Long bookId) {
        log.info("Fetching availability for book ID: {}", bookId);
        return searchRepository.getBookAvailability(bookId, LocalDateTime.now());
    }
    
    public List<AvailabilitySlotDTO> getUpcomingAvailability(int days) {
        log.info("Fetching upcoming availability for next {} days", days);
        LocalDateTime now = LocalDateTime.now();
        return searchRepository.getUpcomingAvailability(
                now.plusDays(days),
                now,
                PageRequest.of(0, 50)
        );
    }
}