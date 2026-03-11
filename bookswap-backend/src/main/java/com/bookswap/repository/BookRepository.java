package com.bookswap.repository;

import com.bookswap.entity.Book;
import com.bookswap.enums.BookCategory;
import com.bookswap.enums.AvailabilityType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {
    
    Optional<Book> findByIsbn(String isbn);
    
    Page<Book> findByOwnerId(Long userId, Pageable pageable);
    
    Page<Book> findByIsAvailableTrue(Pageable pageable);
    
    Page<Book> findByCategory(BookCategory category, Pageable pageable);
    
    @Query("SELECT b FROM Book b WHERE b.isAvailable = true AND (LOWER(b.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(b.author) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Book> searchBooks(@Param("keyword") String keyword, Pageable pageable);
    
    @Query("SELECT b FROM Book b WHERE b.isAvailable = true AND b.category = :category AND (LOWER(b.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(b.author) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Book> searchBooksByCategory(@Param("keyword") String keyword, @Param("category") BookCategory category, Pageable pageable);
    
    List<Book> findByOwnerId(Long userId);
    
    // ===== NEW METHODS FOR ADMIN DASHBOARD =====
    
    // Count by availability type
    long countByAvailabilityType(AvailabilityType type);
    
    // Count by owner ID
    long countByOwnerId(Long ownerId);
    
    // Count by owner ID and is available true
    long countByOwnerIdAndIsAvailableTrue(Long ownerId);
    
    // Delete by owner ID
    void deleteByOwnerId(Long ownerId);
    
    // Find popular categories
    @Query("SELECT b.category, COUNT(b) FROM Book b GROUP BY b.category ORDER BY COUNT(b) DESC")
    List<Object[]> findPopularCategories();
}