package com.bookswap.repository;

import com.bookswap.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByEmail(String email);
    
    boolean existsByEmail(String email);
    
    // ===== NEW METHODS FOR ADMIN DASHBOARD =====
    
    // Find top 5 users by created at desc
    List<User> findTop5ByOrderByCreatedAtDesc();
    
    // Count by created at between
    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
}