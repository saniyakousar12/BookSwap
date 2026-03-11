package com.bookswap.controller;

import com.bookswap.dto.BookDTO;
import com.bookswap.dto.TransactionDTO;
import com.bookswap.dto.UserDTO;
import com.bookswap.service.AdminService;
import com.bookswap.service.JwtTokenProvider;
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
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class AdminController {

    private final AdminService adminService;
    private final JwtTokenProvider jwtTokenProvider;

    private Long getUserIdFromToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }
        String token = authHeader.substring(7);
        return jwtTokenProvider.getUserIdFromToken(token);
    }

    private boolean isAdmin(String authHeader) {
        Long userId = getUserIdFromToken(authHeader);
        // You might want to check if user is admin here
        return userId != null;
    }

    // ===== DASHBOARD STATS =====
    @GetMapping("/dashboard/stats")
    public ResponseEntity<?> getDashboardStats(@RequestHeader("Authorization") String authHeader) {
        if (!isAdmin(authHeader)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        try {
            Map<String, Object> stats = adminService.getDashboardStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("Error fetching dashboard stats: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ===== USERS MANAGEMENT =====
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestHeader("Authorization") String authHeader) {
        
        if (!isAdmin(authHeader)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
            Page<UserDTO> users = adminService.getAllUsers(pageable);
            
            Map<String, Object> response = new HashMap<>();
            response.put("content", users.getContent());
            response.put("totalElements", users.getTotalElements());
            response.put("totalPages", users.getTotalPages());
            response.put("currentPage", users.getNumber());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching users: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/users/{userId}/toggle-status")
    public ResponseEntity<?> toggleUserStatus(
            @PathVariable Long userId,
            @RequestHeader("Authorization") String authHeader) {
        
        if (!isAdmin(authHeader)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        try {
            UserDTO user = adminService.toggleUserStatus(userId);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error toggling user status: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<?> deleteUser(
            @PathVariable Long userId,
            @RequestHeader("Authorization") String authHeader) {
        
        if (!isAdmin(authHeader)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        try {
            adminService.deleteUser(userId);
            return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error deleting user: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ===== BOOKS MANAGEMENT =====
    @GetMapping("/books")
    public ResponseEntity<?> getAllBooks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestHeader("Authorization") String authHeader) {
        
        if (!isAdmin(authHeader)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
            Page<BookDTO> books = adminService.getAllBooks(pageable);
            
            Map<String, Object> response = new HashMap<>();
            response.put("content", books.getContent());
            response.put("totalElements", books.getTotalElements());
            response.put("totalPages", books.getTotalPages());
            response.put("currentPage", books.getNumber());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching books: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/books/{bookId}")
    public ResponseEntity<?> deleteBook(
            @PathVariable Long bookId,
            @RequestHeader("Authorization") String authHeader) {
        
        if (!isAdmin(authHeader)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        try {
            adminService.deleteBook(bookId);
            return ResponseEntity.ok(Map.of("message", "Book deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error deleting book: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ===== TRANSACTIONS MANAGEMENT =====
    @GetMapping("/transactions")
    public ResponseEntity<?> getAllTransactions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestHeader("Authorization") String authHeader) {
        
        if (!isAdmin(authHeader)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
            Page<TransactionDTO> transactions = adminService.getAllTransactions(pageable);
            
            Map<String, Object> response = new HashMap<>();
            response.put("content", transactions.getContent());
            response.put("totalElements", transactions.getTotalElements());
            response.put("totalPages", transactions.getTotalPages());
            response.put("currentPage", transactions.getNumber());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching transactions: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ===== REVENUE STATS =====
    @GetMapping("/revenue")
    public ResponseEntity<?> getRevenueStats(
            @RequestParam(defaultValue = "month") String period,
            @RequestHeader("Authorization") String authHeader) {
        
        if (!isAdmin(authHeader)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        try {
            Map<String, Object> stats = adminService.getRevenueStats(period);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("Error fetching revenue stats: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ===== USER STATS =====
    @GetMapping("/users/{userId}/stats")
    public ResponseEntity<?> getUserStats(
            @PathVariable Long userId,
            @RequestHeader("Authorization") String authHeader) {
        
        if (!isAdmin(authHeader)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        try {
            Map<String, Object> stats = adminService.getUserStats(userId);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("Error fetching user stats: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ===== BOOK STATS =====
    @GetMapping("/books/{bookId}/stats")
    public ResponseEntity<?> getBookStats(
            @PathVariable Long bookId,
            @RequestHeader("Authorization") String authHeader) {
        
        if (!isAdmin(authHeader)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        try {
            Map<String, Object> stats = adminService.getBookStats(bookId);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("Error fetching book stats: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}