package com.bookswap.controller;

import com.bookswap.dto.NotificationDTO;
import com.bookswap.service.JwtTokenProvider;
import com.bookswap.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class NotificationController {

    private final NotificationService notificationService;
    private final JwtTokenProvider jwtTokenProvider;

    private Long getUserIdFromToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }
        String token = authHeader.substring(7);
        return jwtTokenProvider.getUserIdFromToken(token);
    }

    // ===== GET USER NOTIFICATIONS =====
    @GetMapping
    public ResponseEntity<?> getUserNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestHeader("Authorization") String authHeader) {
        
        Long userId = getUserIdFromToken(authHeader);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<NotificationDTO> notifications = notificationService.getUserNotifications(userId, pageable);
        
        Map<String, Object> response = new HashMap<>();
        response.put("content", notifications.getContent());
        response.put("totalElements", notifications.getTotalElements());
        response.put("totalPages", notifications.getTotalPages());
        response.put("currentPage", notifications.getNumber());
        
        return ResponseEntity.ok(response);
    }

    // ===== GET UNREAD COUNT =====
    @GetMapping("/unread/count")
    public ResponseEntity<?> getUnreadCount(@RequestHeader("Authorization") String authHeader) {
        Long userId = getUserIdFromToken(authHeader);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        long count = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(count);
    }

    // ===== MARK AS READ =====
    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {
        
        Long userId = getUserIdFromToken(authHeader);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        notificationService.markAsRead(id);
        return ResponseEntity.ok(Map.of("message", "Notification marked as read"));
    }

    // ===== MARK ALL AS READ =====
    @PutMapping("/read-all")
    public ResponseEntity<?> markAllAsRead(@RequestHeader("Authorization") String authHeader) {
        Long userId = getUserIdFromToken(authHeader);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
    }
}