package com.tiwizi.donation.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DonationRequest {

    @NotNull(message = "Campaign ID is required")
    private String campaignId;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "10.0", message = "Minimum donation amount is 10 MAD")
    private BigDecimal amount;

    @Builder.Default
    private Boolean isAnonymous = false;

    private String paymentMethod;
}
