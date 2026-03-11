package com.bookswap.controller;

import com.bookswap.dto.BookDTO;
import com.bookswap.dto.BookRequest;
import com.bookswap.dto.WishlistDTO;
import com.bookswap.service.BookService;
import com.bookswap.service.JwtTokenProvider;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class BookController {

    private final BookService bookService;
    private final JwtTokenProvider jwtTokenProvider;

    private Long getUserIdFromToken(String token) {
        return jwtTokenProvider.getUserIdFromToken(token);
    }

    // CREATE - Add new book
    @PostMapping
    public ResponseEntity<BookDTO> addBook(
            @Valid @RequestBody BookRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        String token = authHeader.substring(7);
        Long userId = getUserIdFromToken(token);
        
        log.info("Adding book for user: {}", userId);
        BookDTO book = bookService.addBook(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(book);
    }

    // READ - Get single book
    @GetMapping("/{id}")
    public ResponseEntity<BookDTO> getBook(@PathVariable Long id) {
        return ResponseEntity.ok(bookService.getBook(id));
    }

    // READ - Get all available books (paginated)
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllBooks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<BookDTO> books = bookService.getAllAvailableBooks(pageable);
        
        Map<String, Object> response = new HashMap<>();
        response.put("content", books.getContent());
        response.put("totalElements", books.getTotalElements());
        response.put("totalPages", books.getTotalPages());
        response.put("currentPage", page);
        response.put("pageSize", size);
        
        return ResponseEntity.ok(response);
    }

    // READ - Get books by category
    @GetMapping("/category/{category}")
    public ResponseEntity<Map<String, Object>> getByCategory(
            @PathVariable String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<BookDTO> books = bookService.getBooksByCategory(category, pageable);
        
        Map<String, Object> response = new HashMap<>();
        response.put("content", books.getContent());
        response.put("totalElements", books.getTotalElements());
        response.put("totalPages", books.getTotalPages());
        response.put("currentPage", page);
        
        return ResponseEntity.ok(response);
    }

    // READ - Search books
    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchBooks(
            @RequestParam String keyword,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<BookDTO> books;
        
        if (category != null && !category.isEmpty()) {
            books = bookService.searchBooksByCategory(keyword, category, pageable);
        } else {
            books = bookService.searchBooks(keyword, pageable);
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("content", books.getContent());
        response.put("totalElements", books.getTotalElements());
        response.put("totalPages", books.getTotalPages());
        response.put("currentPage", page);
        
        return ResponseEntity.ok(response);
    }

    // READ - Get user's books
    @GetMapping("/user/my-books")
    public ResponseEntity<Map<String, Object>> getUserBooks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        String token = authHeader.substring(7);
        Long userId = getUserIdFromToken(token);
        
        Pageable pageable = PageRequest.of(page, size);
        Page<BookDTO> books = bookService.getUserBooks(userId, pageable);
        
        Map<String, Object> response = new HashMap<>();
        response.put("content", books.getContent());
        response.put("totalElements", books.getTotalElements());
        response.put("totalPages", books.getTotalPages());
        
        return ResponseEntity.ok(response);
    }

    // UPDATE - Update book
    @PutMapping("/{id}")
    public ResponseEntity<BookDTO> updateBook(
            @PathVariable Long id,
            @Valid @RequestBody BookRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        String token = authHeader.substring(7);
        Long userId = getUserIdFromToken(token);
        
        log.info("Updating book: {} for user: {}", id, userId);
        BookDTO book = bookService.updateBook(id, request, userId);
        return ResponseEntity.ok(book);
    }

    // DELETE - Delete book
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteBook(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        String token = authHeader.substring(7);
        Long userId = getUserIdFromToken(token);
        
        log.info("Deleting book: {} for user: {}", id, userId);
        bookService.deleteBook(id, userId);
        return ResponseEntity.ok(Map.of("message", "Book deleted successfully"));
    }

    // WISHLIST - Add to wishlist
    @PostMapping("/{id}/wishlist")
    public ResponseEntity<Map<String, String>> addToWishlist(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        String token = authHeader.substring(7);
        Long userId = getUserIdFromToken(token);
        
        bookService.addToWishlist(id, userId);
        return ResponseEntity.ok(Map.of("message", "Book added to wishlist"));
    }

    // WISHLIST - Remove from wishlist
    @DeleteMapping("/{id}/wishlist")
    public ResponseEntity<Map<String, String>> removeFromWishlist(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        String token = authHeader.substring(7);
        Long userId = getUserIdFromToken(token);
        
        bookService.removeFromWishlist(id, userId);
        return ResponseEntity.ok(Map.of("message", "Book removed from wishlist"));
    }

    // WISHLIST - Get user's wishlist
    @GetMapping("/wishlist")
    public ResponseEntity<List<WishlistDTO>> getWishlist(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        String token = authHeader.substring(7);
        Long userId = getUserIdFromToken(token);
        
        return ResponseEntity.ok(bookService.getUserWishlist(userId));
    }

    // WISHLIST - Check if book is in wishlist
    @GetMapping("/{id}/in-wishlist")
    public ResponseEntity<Map<String, Boolean>> isInWishlist(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.ok(Map.of("inWishlist", false));
        }
        
        String token = authHeader.substring(7);
        Long userId = getUserIdFromToken(token);
        
        boolean inWishlist = bookService.isInWishlist(id, userId);
        return ResponseEntity.ok(Map.of("inWishlist", inWishlist));
    }

    // GET - Get all categories
    @GetMapping("/categories/all")
    public ResponseEntity<List<String>> getCategories() {
        List<String> categories = List.of(
            "FICTION", "NON_FICTION", "MYSTERY", "ROMANCE", "SCIENCE_FICTION",
            "FANTASY", "BIOGRAPHY", "HISTORY", "SCIENCE", "SELF_HELP",
            "TECHNOLOGY", "ARTS", "CHILDREN", "OTHER"
        );
        return ResponseEntity.ok(categories);
    }
}