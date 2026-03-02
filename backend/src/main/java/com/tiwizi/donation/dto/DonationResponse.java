package com.tiwizi.donation.dto;

import com.tiwizi.enums.DonationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DonationResponse {

    private String id;
    private String campaignId;
    private String campaignTitle;
    private String donorId;
    private String donorName;
    private BigDecimal amount;
    private DonationStatus status;
    private Boolean isAnonymous;
    private LocalDateTime createdAt;
    private LocalDateTime paidAt;
    private String receiptUrl;
    private String transactionId; // Payment Intent client secret for Stripe
    private Boolean paidWithSavedCard; // True if payment was auto-confirmed via saved card
}
