package com.bookswap.specification;

import com.bookswap.entity.Book;
import com.bookswap.entity.Transaction;
import com.bookswap.enums.BookCategory;
import com.bookswap.enums.AvailabilityType;
import com.bookswap.enums.TransactionStatus;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class SearchSpecification {

    public static Specification<Book> withFilters(
            String keyword,
            String title,
            String author,
            String isbn,
            String publisher,
            BookCategory category,
            String condition,
            AvailabilityType availabilityType,
            Double minPrice,
            Double maxPrice,
            Boolean availableOnly,
            LocalDateTime availableFrom,
            LocalDateTime availableUntil,
            Double latitude,
            Double longitude,
            Double maxDistance) {
        
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            // Text search
            if (StringUtils.hasText(keyword)) {
                String pattern = "%" + keyword.toLowerCase() + "%";
                Predicate titleMatch = cb.like(cb.lower(root.get("title")), pattern);
                Predicate authorMatch = cb.like(cb.lower(root.get("author")), pattern);
                Predicate isbnMatch = cb.like(root.get("isbn"), "%" + keyword + "%");
                if (StringUtils.hasText(publisher)) {
                    Predicate publisherMatch = cb.like(cb.lower(root.get("publisher")), pattern);
                    predicates.add(cb.or(titleMatch, authorMatch, isbnMatch, publisherMatch));
                } else {
                    predicates.add(cb.or(titleMatch, authorMatch, isbnMatch));
                }
            }
            
            // Specific field filters
            if (StringUtils.hasText(title)) {
                predicates.add(cb.like(cb.lower(root.get("title")), "%" + title.toLowerCase() + "%"));
            }
            
            if (StringUtils.hasText(author)) {
                predicates.add(cb.like(cb.lower(root.get("author")), "%" + author.toLowerCase() + "%"));
            }
            
            if (StringUtils.hasText(isbn)) {
                predicates.add(cb.equal(root.get("isbn"), isbn));
            }
            
            if (StringUtils.hasText(publisher)) {
                predicates.add(cb.like(cb.lower(root.get("publisher")), "%" + publisher.toLowerCase() + "%"));
            }
            
            // Category filter
            if (category != null) {
                predicates.add(cb.equal(root.get("category"), category));
            }
            
            // Condition filter
            if (StringUtils.hasText(condition)) {
                predicates.add(cb.equal(root.get("bookCondition"), condition));
            }
            
            // Availability type filter
            if (availabilityType != null) {
                predicates.add(cb.equal(root.get("availabilityType"), availabilityType));
            }
            
            // Price range for rent
            if (minPrice != null || maxPrice != null) {
                if (minPrice != null && maxPrice != null) {
                    predicates.add(cb.between(root.get("rentalPricePerDay"), minPrice, maxPrice));
                } else if (minPrice != null) {
                    predicates.add(cb.greaterThanOrEqualTo(root.get("rentalPricePerDay"), minPrice));
                } else if (maxPrice != null) {
                    predicates.add(cb.lessThanOrEqualTo(root.get("rentalPricePerDay"), maxPrice));
                }
            }
            
            // Availability
            if (availableOnly != null && availableOnly) {
                predicates.add(cb.isTrue(root.get("isAvailable")));
            }
            
            // Location filter (simplified - would need proper geolocation in real app)
            if (latitude != null && longitude != null && maxDistance != null) {
                // This is a simplified version - in production, use spatial queries
                // For now, we'll filter by owner's city/location string
                // You can enhance with Hibernate Spatial or similar
            }
            
            // Availability calendar - check if book is free during requested period
            if (availableFrom != null && availableUntil != null) {
                Subquery<Long> transactionSubquery = query.subquery(Long.class);
                Root<Transaction> transactionRoot = transactionSubquery.from(Transaction.class);
                transactionSubquery.select(transactionRoot.get("book").get("id"));
                
                Predicate overlapping = cb.and(
                    cb.equal(transactionRoot.get("book").get("id"), root.get("id")),
                    cb.or(
                        cb.and(
                            cb.lessThan(transactionRoot.get("startDate"), availableUntil),
                            cb.greaterThan(transactionRoot.get("endDate"), availableFrom)
                        ),
                        cb.equal(transactionRoot.get("status"), TransactionStatus.ACTIVE)
                    )
                );
                
                transactionSubquery.where(overlapping);
                predicates.add(cb.not(root.get("id").in(transactionSubquery)));
            }
            
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}