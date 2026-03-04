package com.tiwizi.payment.dto;

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
public class PaymentRequest {

    @NotNull(message = "Donation ID is required")
    private String donationId;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "10.0", message = "Minimum payment amount is 10 MAD")
    private BigDecimal amount;

    @NotNull(message = "Payment method is required")
    private String paymentMethod; // CARD, BANK_TRANSFER, etc.

    private String cardNumber; // For mock payment
    private String cardHolderName;
    private String expiryDate;
    private String cvv;

    // For saved card payments
    private String stripeCustomerId;
    private String stripePaymentMethodId;
}
