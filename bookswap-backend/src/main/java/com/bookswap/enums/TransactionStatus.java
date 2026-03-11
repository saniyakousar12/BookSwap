package com.bookswap.enums;

public enum TransactionStatus {
    PENDING("Request sent, waiting for owner approval"),
    APPROVED("Owner approved, waiting for pickup/delivery"),
    ACTIVE("Book is currently with borrower/renter"),
    COMPLETED("Transaction finished successfully"),
    REJECTED("Owner rejected the request"),
    CANCELLED("User cancelled the request"),
    EXPIRED("Request expired (for rent with time limit)");

    private final String description;

    TransactionStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}