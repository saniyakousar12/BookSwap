package com.bookswap.service;

import com.bookswap.dto.BookDTO;
import com.bookswap.dto.BookRequest;
import com.bookswap.dto.WishlistDTO;
import com.bookswap.entity.Book;
import com.bookswap.entity.User;
import com.bookswap.entity.Wishlist;
import com.bookswap.enums.BookCategory;
import com.bookswap.enums.AvailabilityType;
import com.bookswap.repository.BookRepository;
import com.bookswap.repository.WishlistRepository;
import com.bookswap.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class BookService {

    private final BookRepository bookRepository;
    private final WishlistRepository wishlistRepository;
    private final UserRepository userRepository;

    // ===== CREATE =====
    public BookDTO addBook(BookRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Validate rental price for RENT type
        if (request.getAvailabilityType() == AvailabilityType.RENT && 
            (request.getRentalPricePerDay() == null || request.getRentalPricePerDay() <= 0)) {
            throw new RuntimeException("Rental price is required for books available for rent");
        }

        Book book = Book.builder()
                .title(request.getTitle())
                .author(request.getAuthor())
                .description(request.getDescription())
                .isbn(request.getIsbn())
                .category(BookCategory.valueOf(request.getCategory().toUpperCase()))
                .publicationYear(request.getPublicationYear())
                .bookCondition(request.getCondition())
                .language(request.getLanguage() != null ? request.getLanguage() : "English")
                .imageUrl(request.getImageUrl())
                .availabilityType(request.getAvailabilityType())
                .rentalPricePerDay(request.getRentalPricePerDay())
                .owner(user)
                .isAvailable(request.getIsAvailable() != null ? request.getIsAvailable() : true)
                .build();

        book = bookRepository.save(book);
        log.info("Book added: {} by user: {} with type: {}", book.getId(), userId, request.getAvailabilityType());
        return convertToDTO(book);
    }

    // ===== READ =====
    public BookDTO getBook(Long bookId) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found with id: " + bookId));
        return convertToDTO(book);
    }

    public Page<BookDTO> getAllAvailableBooks(Pageable pageable) {
        Page<Book> books = bookRepository.findByIsAvailableTrue(pageable);
        return books.map(this::convertToDTO);
    }

    public Page<BookDTO> getBooksByCategory(String category, Pageable pageable) {
        try {
            BookCategory bookCategory = BookCategory.valueOf(category.toUpperCase());
            Page<Book> books = bookRepository.findByCategory(bookCategory, pageable);
            return books.map(this::convertToDTO);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid category: " + category);
        }
    }

    public Page<BookDTO> searchBooks(String keyword, Pageable pageable) {
        Page<Book> books = bookRepository.searchBooks(keyword, pageable);
        return books.map(this::convertToDTO);
    }

    public Page<BookDTO> searchBooksByCategory(String keyword, String category, Pageable pageable) {
        try {
            BookCategory bookCategory = BookCategory.valueOf(category.toUpperCase());
            Page<Book> books = bookRepository.searchBooksByCategory(keyword, bookCategory, pageable);
            return books.map(this::convertToDTO);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid category: " + category);
        }
    }

    public Page<BookDTO> getUserBooks(Long userId, Pageable pageable) {
        Page<Book> books = bookRepository.findByOwnerId(userId, pageable);
        return books.map(this::convertToDTO);
    }

    // ===== UPDATE =====
    public BookDTO updateBook(Long bookId, BookRequest request, Long userId) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found with id: " + bookId));

        if (!book.getOwner().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized: You can only update your own books");
        }

        // Validate rental price for RENT type
        if (request.getAvailabilityType() == AvailabilityType.RENT && 
            (request.getRentalPricePerDay() == null || request.getRentalPricePerDay() <= 0)) {
            throw new RuntimeException("Rental price is required for books available for rent");
        }

        book.setTitle(request.getTitle());
        book.setAuthor(request.getAuthor());
        book.setDescription(request.getDescription());
        book.setIsbn(request.getIsbn());
        book.setCategory(BookCategory.valueOf(request.getCategory().toUpperCase()));
        book.setPublicationYear(request.getPublicationYear());
        book.setBookCondition(request.getCondition());
        book.setLanguage(request.getLanguage() != null ? request.getLanguage() : "English");
        book.setImageUrl(request.getImageUrl());
        book.setAvailabilityType(request.getAvailabilityType());
        book.setRentalPricePerDay(request.getRentalPricePerDay());
        
        if (request.getIsAvailable() != null) {
            book.setIsAvailable(request.getIsAvailable());
        }

        book = bookRepository.save(book);
        log.info("Book updated: {} by user: {}", bookId, userId);
        return convertToDTO(book);
    }

    // ===== DELETE =====
    public void deleteBook(Long bookId, Long userId) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found with id: " + bookId));

        if (!book.getOwner().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized: You can only delete your own books");
        }

        bookRepository.deleteById(bookId);
        log.info("Book deleted: {} by user: {}", bookId, userId);
    }

    // ===== WISHLIST =====
    public void addToWishlist(Long bookId, Long userId) {
        if (wishlistRepository.existsByUserIdAndBookId(userId, bookId)) {
            return; // silently skip instead of throwing 500
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found"));

        Wishlist wishlist = Wishlist.builder()
                .user(user)
                .book(book)
                .build();

        wishlistRepository.save(wishlist);
        log.info("Book {} added to wishlist for user {}", bookId, userId);
    }

    public void removeFromWishlist(Long bookId, Long userId) {
        log.info("Removing from wishlist - bookId: {}, userId: {}", bookId, userId);
        wishlistRepository.deleteByUserIdAndBookId(userId, bookId);
        log.info("Book {} removed from wishlist for user {}", bookId, userId);
    }

    public List<WishlistDTO> getUserWishlist(Long userId) {
        List<Wishlist> wishlist = wishlistRepository.findByUserId(userId);
        return wishlist.stream()
                .map(this::convertWishlistToDTO)
                .collect(Collectors.toList());
    }

    public boolean isInWishlist(Long bookId, Long userId) {
        return wishlistRepository.existsByUserIdAndBookId(userId, bookId);
    }

    // ===== HELPER METHODS =====
    public BookDTO convertToDTO(Book book) {
        return BookDTO.builder()
                .id(book.getId())
                .title(book.getTitle())
                .author(book.getAuthor())
                .description(book.getDescription())
                .isbn(book.getIsbn())
                .category(book.getCategory())
                .publicationYear(book.getPublicationYear())
                .condition(book.getBookCondition())
                .language(book.getLanguage())
                .imageUrl(book.getImageUrl())
                .availabilityType(book.getAvailabilityType())
                .rentalPricePerDay(book.getRentalPricePerDay())
                .ownerId(book.getOwner().getId())
                .ownerName(book.getOwner().getFullName())
                .isAvailable(book.getIsAvailable())
                .createdAt(book.getCreatedAt())
                .updatedAt(book.getUpdatedAt())
                .build();
    }

    private WishlistDTO convertWishlistToDTO(Wishlist wishlist) {
        return WishlistDTO.builder()
                .id(wishlist.getId())
                .book(convertToDTO(wishlist.getBook()))
                .addedAt(wishlist.getAddedAt())
                .build();
    }
}