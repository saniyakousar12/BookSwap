package com.bookswap.enums;

public enum NotificationType {
    // Request notifications
    NEW_REQUEST("New book request received"),
    REQUEST_APPROVED("Your book request was approved"),
    REQUEST_REJECTED("Your book request was rejected"),
    REQUEST_CANCELLED("A request was cancelled"),
    
    // Transaction notifications
    TRANSACTION_STARTED("Transaction has started"),
    TRANSACTION_COMPLETED("Transaction completed"),
    RETURN_REMINDER("Book return date approaching"),
    RETURN_OVERDUE("Book return is overdue"),
    
    // Payment notifications
    PAYMENT_RECEIVED("Payment received"),
    PAYMENT_CONFIRMED("Payment confirmed"),
    
    // Review notifications
    NEW_REVIEW("New review received"),
    
    // System notifications
    WELCOME("Welcome to BookSwap"),
    BOOK_AVAILABLE("A book on your wishlist is now available");

    private final String description;

    NotificationType(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}