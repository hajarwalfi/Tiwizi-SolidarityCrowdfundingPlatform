package com.tiwizi.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatsResponse {
    private long totalCampaigns;
    private long pendingCampaigns;
    private long approvedCampaigns;
    private long rejectedCampaigns;
    private long closedCampaigns;
    private long totalUsers;
    private long totalDonations;
    private BigDecimal totalAmountRaised;
    private long totalReports;
}
