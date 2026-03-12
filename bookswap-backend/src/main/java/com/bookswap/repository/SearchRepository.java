package com.bookswap.repository;

import com.bookswap.dto.PriceRangeDTO;
import com.bookswap.dto.PriceComparisonDTO;
import com.bookswap.dto.AvailabilitySlotDTO;
import com.bookswap.entity.Book;
import com.bookswap.enums.BookCategory;
import com.bookswap.enums.AvailabilityType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SearchRepository extends JpaRepository<Book, Long>, JpaSpecificationExecutor<Book> {
    
    // Price range for rent books
    @Query("SELECT NEW com.bookswap.dto.PriceRangeDTO(" +
           "MIN(b.rentalPricePerDay), " +
           "MAX(b.rentalPricePerDay), " +
           "AVG(b.rentalPricePerDay), " +
           "COUNT(b)) " +
           "FROM Book b WHERE b.availabilityType = 'RENT' AND b.isAvailable = true")
    PriceRangeDTO getRentalPriceRange();
    
    // Price comparison for similar books - FIXED parameter order to match DTO constructor
    @Query("SELECT NEW com.bookswap.dto.PriceComparisonDTO(" +
           "b.id, " +
           "b.title, " +
           "b.author, " +
           "b.rentalPricePerDay, " +
           "CONCAT(b.owner.firstName, ' ', b.owner.lastName), " +
           "COALESCE((SELECT AVG(r.rating) FROM Review r WHERE r.reviewee.id = b.owner.id), 0), " +
           "b.owner.city, " +
           ":distance) " +
           "FROM Book b " +
           "WHERE b.availabilityType = 'RENT' " +
           "AND b.category = :category " +
           "AND b.isAvailable = true " +
           "ORDER BY b.rentalPricePerDay ASC")
    List<PriceComparisonDTO> compareRentalPrices(
            @Param("category") BookCategory category,
            @Param("distance") Double distance,
            Pageable pageable);
    
    // Availability slots for a book - FIXED query
    @Query("SELECT NEW com.bookswap.dto.AvailabilitySlotDTO(" +
           "b.id, " +
           "b.title, " +
           "CASE WHEN MAX(t.endDate) IS NOT NULL THEN MAX(t.endDate) ELSE :now END, " +
           "NULL, " +
           "CASE WHEN b.isAvailable = true THEN 'AVAILABLE' ELSE 'BOOKED' END) " +
           "FROM Book b " +
           "LEFT JOIN Transaction t ON t.book.id = b.id AND t.status = 'ACTIVE' " +
           "WHERE b.id = :bookId " +
           "GROUP BY b.id, b.title, b.isAvailable")
    AvailabilitySlotDTO getBookAvailability(
            @Param("bookId") Long bookId,
            @Param("now") LocalDateTime now);
    
    // Get all available slots in next 30 days - FIXED query
    @Query("SELECT NEW com.bookswap.dto.AvailabilitySlotDTO(" +
           "b.id, " +
           "b.title, " +
           "COALESCE(MAX(t.endDate), :now), " +
           "NULL, " +
           "'AVAILABLE') " +
           "FROM Book b " +
           "LEFT JOIN Transaction t ON t.book.id = b.id AND t.status = 'ACTIVE' " +
           "WHERE b.isAvailable = true " +
           "AND (MAX(t.endDate) IS NULL OR MAX(t.endDate) < :futureDate) " +
           "GROUP BY b.id, b.title " +
           "ORDER BY COALESCE(MAX(t.endDate), :now) ASC")
    List<AvailabilitySlotDTO> getUpcomingAvailability(
            @Param("futureDate") LocalDateTime futureDate,
            @Param("now") LocalDateTime now,
            Pageable pageable);
}