package com.tiwizi.beneficiary.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BeneficiaryDashboardStatsResponse {

    // Campaign counts by status
    private Integer totalCampaigns;
    private Integer activeCampaigns;
    private Integer pendingCampaigns;
    private Integer rejectedCampaigns;
    private Integer completedCampaigns;

    // Financial stats
    private BigDecimal totalAmountRaised;
    private BigDecimal totalGoalAmount;
    private Double overallProgressPercentage;

    // Engagement stats
    private Integer totalDonors;
    private Integer totalDonations;
    private Integer totalCampaignUpdates;

    // Recent activity
    private Integer recentDonationsCount; // Last 7 days
    private BigDecimal recentDonationsAmount; // Last 7 days
}