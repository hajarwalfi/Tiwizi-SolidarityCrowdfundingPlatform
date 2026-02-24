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

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CampaignResponse {
    private String id;
    private String title;
    private String description;
    private BigDecimal goalAmount;
    private BigDecimal amountCollected;
    private CampaignStatus status;
    private CampaignCategory category;
    private String location;
    private LocalDate deadline;
    private Boolean isUrgent;
    private String creatorName;
    private String creatorProfilePicture;
    private LocalDateTime createdAt;
    private double progressPercentage;
    private int donorCount;
}
