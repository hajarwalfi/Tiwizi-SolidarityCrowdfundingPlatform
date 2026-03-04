package com.tiwizi.payment.dto;

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
public class PaymentResponse {

    private String transactionId;
    private String donationId;
    private String status; // SUCCESS, FAILED, PENDING
    private BigDecimal amount;
    private String paymentMethod;
    private String message;
    private LocalDateTime processedAt;
    private String clientSecret; // For Stripe Payment Intent client secret
}
