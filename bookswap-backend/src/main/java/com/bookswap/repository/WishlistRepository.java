package com.bookswap.repository;

import com.bookswap.entity.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface WishlistRepository extends JpaRepository<Wishlist, Long> {
    
    List<Wishlist> findByUserId(Long userId);
    
    Optional<Wishlist> findByUserIdAndBookId(Long userId, Long bookId);
    
    boolean existsByUserIdAndBookId(Long userId, Long bookId);
    
    void deleteByUserIdAndBookId(Long userId, Long bookId);
    
    void deleteAllByBookId(Long bookId);
    
    // ===== NEW METHODS FOR ADMIN DASHBOARD =====
    
    // Delete by user ID
    void deleteByUserId(Long userId);
    
    // Delete by book ID
    void deleteByBookId(Long bookId);
    
    // Count by user ID
    long countByUserId(Long userId);
    
    // Count by book ID
    long countByBookId(Long bookId);
}