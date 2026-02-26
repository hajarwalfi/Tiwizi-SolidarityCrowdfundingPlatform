package com.tiwizi.beneficiary.dto;

import com.tiwizi.enums.CampaignCategory;
import com.tiwizi.enums.CampaignStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BeneficiaryCampaignResponse {

    private String id;
    private String title;
    private String description;
    private BigDecimal goalAmount;
    private BigDecimal amountCollected;
    private CampaignStatus status;
    private CampaignCategory category;
    private String location;
    private Double progressPercentage;
    private LocalDate deadline;
    private Boolean isUrgent;
    private LocalDateTime createdAt;
    private LocalDateTime approvedAt;

    // Statistics
    private Integer donorCount;
    private Integer donationCount;
    private Integer updateCount;
    private Integer viewCount;

    // Rejection info if applicable
    private String rejectionReason;

    // Contact info
    private String ribNumber;
    private String phone;
    private String contactEmail;
    private String facebook;
    private String instagram;
    private String twitter;
    private String website;

    // Uploaded documents (photos, ID card, RIB, etc.)
    private List<DocumentResponse> documents;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DocumentResponse {
        private String id;
        private String documentType;
        private String fileUrl;
    }
}