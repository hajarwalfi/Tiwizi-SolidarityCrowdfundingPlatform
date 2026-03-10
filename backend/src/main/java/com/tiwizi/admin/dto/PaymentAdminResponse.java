package com.tiwizi.admin.dto;

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
public class PaymentAdminResponse {

    private String id;
    private String campaignId;
    private String campaignTitle;
    private String donorId;
    private String donorEmail;
    private String donorName;
    private BigDecimal amount;
    private String currency;
    private DonationStatus status;
    private String paymentMethod;
    private String stripePaymentIntentId;
    private LocalDateTime createdAt;
}
