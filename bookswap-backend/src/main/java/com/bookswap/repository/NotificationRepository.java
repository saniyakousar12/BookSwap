package com.bookswap.repository;

import com.bookswap.entity.Notification;
import com.bookswap.entity.User;
import com.bookswap.enums.NotificationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    // Get notifications for a user
    Page<Notification> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    
    List<Notification> findTop10ByUserIdOrderByCreatedAtDesc(Long userId);
    
    // Count unread notifications
    long countByUserIdAndIsReadFalse(Long userId);
    
    // Mark all as read for a user
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.user.id = :userId AND n.isRead = false")
    void markAllAsRead(@Param("userId") Long userId);
    
    // Mark specific notification as read
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.id = :notificationId")
    void markAsRead(@Param("notificationId") Long notificationId);
    
    // Find notifications by type
    List<Notification> findByUserIdAndType(Long userId, NotificationType type);
    
    // Delete old notifications
    void deleteByCreatedAtBefore(LocalDateTime date);
    
    // Check if similar notification exists (to prevent duplicates)
    boolean existsByUserIdAndTypeAndRelatedTransactionIdAndIsReadFalse(
        Long userId, NotificationType type, Long transactionId);
        
}