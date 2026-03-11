package com.bookswap.dto;

import lombok.*;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminDashboardDTO {
    // Overview Stats
    private Long totalUsers;
    private Long totalBooks;
    private Long totalTransactions;
    private Long activeTransactions;
    private Long totalRentMoney;
    private Long pendingRequests;
    
    // Charts Data
    private List<Map<String, Object>> userGrowth;
    private List<Map<String, Object>> bookCategories;
    private List<Map<String, Object>> transactionTrends;
    private List<Map<String, Object>> topUsers;
    private List<Map<String, Object>> popularBooks;
    private Map<String, Long> transactionStatus;
    private Map<String, Long> availabilityTypes;
    
    // Recent Activities
    private List<Map<String, Object>> recentTransactions;
    private List<Map<String, Object>> recentUsers;
}