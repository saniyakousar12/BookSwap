package com.bookswap.controller;

import com.bookswap.dto.TransactionDTO;
import com.bookswap.dto.TransactionRequestDTO;
import com.bookswap.service.JwtTokenProvider;
import com.bookswap.service.TransactionService;
import jakarta.validation.Valid;
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
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class TransactionController {

    private final TransactionService transactionService;
    private final JwtTokenProvider jwtTokenProvider;

    private Long getUserIdFromToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }
        String token = authHeader.substring(7);
        return jwtTokenProvider.getUserIdFromToken(token);
    }

    // ===== REQUEST BOOK =====
    @PostMapping("/request")
    public ResponseEntity<?> requestBook(
            @Valid @RequestBody TransactionRequestDTO request,
            @RequestHeader("Authorization") String authHeader) {
        
        Long userId = getUserIdFromToken(authHeader);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        try {
            TransactionDTO transaction = transactionService.requestBook(request, userId);
            return ResponseEntity.status(HttpStatus.CREATED).body(transaction);
        } catch (RuntimeException e) {
            log.error("Error requesting book: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ===== APPROVE REQUEST =====
    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveRequest(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {
        
        Long userId = getUserIdFromToken(authHeader);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        try {
            TransactionDTO transaction = transactionService.approveRequest(id, userId);
            return ResponseEntity.ok(transaction);
        } catch (RuntimeException e) {
            log.error("Error approving request: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ===== REJECT REQUEST =====
    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectRequest(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {
        
        Long userId = getUserIdFromToken(authHeader);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        try {
            TransactionDTO transaction = transactionService.rejectRequest(id, userId);
            return ResponseEntity.ok(transaction);
        } catch (RuntimeException e) {
            log.error("Error rejecting request: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ===== START TRANSACTION =====
    @PutMapping("/{id}/start")
    public ResponseEntity<?> startTransaction(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {
        
        Long userId = getUserIdFromToken(authHeader);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        try {
            TransactionDTO transaction = transactionService.startTransaction(id, userId);
            return ResponseEntity.ok(transaction);
        } catch (RuntimeException e) {
            log.error("Error starting transaction: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ===== COMPLETE TRANSACTION =====
    @PutMapping("/{id}/complete")
    public ResponseEntity<?> completeTransaction(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {
        
        Long userId = getUserIdFromToken(authHeader);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        try {
            TransactionDTO transaction = transactionService.completeTransaction(id, userId);
            return ResponseEntity.ok(transaction);
        } catch (RuntimeException e) {
            log.error("Error completing transaction: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ===== CANCEL REQUEST =====
    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelRequest(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {
        
        Long userId = getUserIdFromToken(authHeader);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        try {
            TransactionDTO transaction = transactionService.cancelRequest(id, userId);
            return ResponseEntity.ok(transaction);
        } catch (RuntimeException e) {
            log.error("Error cancelling request: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ===== GET USER'S REQUESTS (as requester) =====
    @GetMapping("/my-requests")
    public ResponseEntity<Map<String, Object>> getMyRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestHeader("Authorization") String authHeader) {
        
        Long userId = getUserIdFromToken(authHeader);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<TransactionDTO> transactions = transactionService.getUserRequests(userId, pageable);
        
        Map<String, Object> response = new HashMap<>();
        response.put("content", transactions.getContent());
        response.put("totalElements", transactions.getTotalElements());
        response.put("totalPages", transactions.getTotalPages());
        response.put("currentPage", page);
        
        return ResponseEntity.ok(response);
    }

    // ===== GET REQUESTS RECEIVED (as owner) =====
    @GetMapping("/received-requests")
    public ResponseEntity<Map<String, Object>> getReceivedRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestHeader("Authorization") String authHeader) {
        
        Long userId = getUserIdFromToken(authHeader);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<TransactionDTO> transactions = transactionService.getUserReceivedRequests(userId, pageable);
        
        Map<String, Object> response = new HashMap<>();
        response.put("content", transactions.getContent());
        response.put("totalElements", transactions.getTotalElements());
        response.put("totalPages", transactions.getTotalPages());
        response.put("currentPage", page);
        
        return ResponseEntity.ok(response);
    }

    // ===== GET PENDING REQUESTS FOR OWNER =====
    @GetMapping("/pending")
    public ResponseEntity<Map<String, Object>> getPendingRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestHeader("Authorization") String authHeader) {
        
        Long userId = getUserIdFromToken(authHeader);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<TransactionDTO> transactions = transactionService.getPendingRequestsForOwner(userId, pageable);
        
        Map<String, Object> response = new HashMap<>();
        response.put("content", transactions.getContent());
        response.put("totalElements", transactions.getTotalElements());
        response.put("totalPages", transactions.getTotalPages());
        response.put("currentPage", page);
        
        return ResponseEntity.ok(response);
    }

    // ===== GET SINGLE TRANSACTION =====
    @GetMapping("/{id}")
    public ResponseEntity<?> getTransaction(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {
        
        Long userId = getUserIdFromToken(authHeader);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        try {
            TransactionDTO transaction = transactionService.getTransaction(id, userId);
            return ResponseEntity.ok(transaction);
        } catch (RuntimeException e) {
            log.error("Error fetching transaction: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}