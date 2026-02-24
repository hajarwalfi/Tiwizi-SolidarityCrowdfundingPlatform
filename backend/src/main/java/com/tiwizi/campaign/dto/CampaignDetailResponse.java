package com.tiwizi.campaign.dto;

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
public class CampaignDetailResponse {
    private String id;
    private String title;
    private String description;
    private BigDecimal goalAmount;
    private BigDecimal amountCollected;
    private CampaignStatus status;
    private CampaignCategory category;
    private String location;
    private String rejectionReason;
    private LocalDate deadline;
    private Boolean isUrgent;
    private String ribNumber;
    private String phone;
    private String contactEmail;
    private String facebook;
    private String instagram;
    private String twitter;
    private String website;
    private String creatorName;
    private String creatorProfilePicture;
    private LocalDateTime createdAt;
    private double progressPercentage;
    private List<DocumentResponse> documents;
    private List<UpdateResponse> updates;
    private List<DonationResponse> donations;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DocumentResponse {
        private String id;
        private String documentType;
        private String fileUrl;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateResponse {
        private String id;
        private String content;
        private String photoUrls;
        private LocalDateTime createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DonationResponse {
        private String id;
        private String donorId;
        private String donorName;
        private String donorProfilePicture;
        private BigDecimal amount;
        private LocalDateTime createdAt;
        private Boolean isAnonymous;
    }
}
