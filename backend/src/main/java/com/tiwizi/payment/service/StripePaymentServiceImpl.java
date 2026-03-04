package com.tiwizi.payment.service;

import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import com.tiwizi.payment.dto.PaymentRequest;
import com.tiwizi.payment.dto.PaymentResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Stripe Payment Service Implementation
 * Handles real payment processing with Stripe
 */
@Service
@Primary  // This will be used instead of MockPaymentServiceImpl
@Slf4j
public class StripePaymentServiceImpl implements PaymentService {

    @Value("${stripe.currency:mad}")
    private String currency;

    @Override
    public PaymentResponse processPayment(PaymentRequest request) {
        log.info("💳 STRIPE: Processing payment for donation: {} | Amount: {} MAD",
                request.getDonationId(), request.getAmount());

        try {
            // Convert MAD to cents (Stripe uses smallest currency unit)
            // For MAD: 1 MAD = 100 centimes
            long amountInCents = request.getAmount().multiply(BigDecimal.valueOf(100)).longValue();

            // Create Payment Intent
            PaymentIntentCreateParams.Builder paramsBuilder = PaymentIntentCreateParams.builder()
                    .setAmount(amountInCents)
                    .setCurrency(currency)
                    .setDescription("Donation for campaign - " + request.getDonationId())
                    .putMetadata("donationId", request.getDonationId())
                    .putMetadata("paymentMethod", request.getPaymentMethod() != null ? request.getPaymentMethod() : "CARD");

            // If the user has a saved card, attach customer + payment method and confirm immediately
            if (request.getStripeCustomerId() != null && request.getStripePaymentMethodId() != null) {
                log.info("💳 STRIPE: Using saved card for customer: {}", request.getStripeCustomerId());
                paramsBuilder
                        .setCustomer(request.getStripeCustomerId())
                        .setPaymentMethod(request.getStripePaymentMethodId())
                        .setOffSession(true)
                        .setConfirm(true);
            } else {
                // No saved card — frontend will collect card details via Stripe Elements
                paramsBuilder.setAutomaticPaymentMethods(
                        PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                .setEnabled(true)
                                .build()
                );
            }

            PaymentIntent paymentIntent = PaymentIntent.create(paramsBuilder.build());

            log.info("✅ STRIPE: Payment Intent created | ID: {} | Status: {} | Client Secret ready",
                    paymentIntent.getId(), paymentIntent.getStatus());

            // Determine status based on Payment Intent status
            String status = mapStripeStatus(paymentIntent.getStatus());

            return PaymentResponse.builder()
                    .transactionId(paymentIntent.getId())
                    .donationId(request.getDonationId())
                    .status(status)
                    .amount(request.getAmount())
                    .paymentMethod(request.getPaymentMethod())
                    .message(getStatusMessage(status))
                    .processedAt(LocalDateTime.now())
                    .clientSecret(paymentIntent.getClientSecret()) // Return client secret for frontend
                    .build();

        } catch (StripeException e) {
            log.error("❌ STRIPE: Payment failed for donation: {} | Error: {}",
                    request.getDonationId(), e.getMessage());

            return PaymentResponse.builder()
                    .transactionId("FAILED-" + System.currentTimeMillis())
                    .donationId(request.getDonationId())
                    .status("FAILED")
                    .amount(request.getAmount())
                    .paymentMethod(request.getPaymentMethod())
                    .message("Payment failed: " + e.getMessage())
                    .processedAt(LocalDateTime.now())
                    .build();
        }
    }

    @Override
    public PaymentResponse verifyPayment(String transactionId) {
        log.info("🔍 STRIPE: Verifying payment | Transaction: {}", transactionId);

        try {
            PaymentIntent paymentIntent = PaymentIntent.retrieve(transactionId);

            String status = mapStripeStatus(paymentIntent.getStatus());
            String donationId = paymentIntent.getMetadata().get("donationId");

            log.info("✅ STRIPE: Payment verified | Status: {} | Donation: {}",
                    status, donationId);

            return PaymentResponse.builder()
                    .transactionId(paymentIntent.getId())
                    .donationId(donationId)
                    .status(status)
                    .amount(BigDecimal.valueOf(paymentIntent.getAmount()).divide(BigDecimal.valueOf(100)))
                    .message(getStatusMessage(status))
                    .processedAt(LocalDateTime.now())
                    .build();

        } catch (StripeException e) {
            log.error("❌ STRIPE: Verification failed | Transaction: {} | Error: {}",
                    transactionId, e.getMessage());

            return PaymentResponse.builder()
                    .transactionId(transactionId)
                    .status("FAILED")
                    .message("Verification failed: " + e.getMessage())
                    .processedAt(LocalDateTime.now())
                    .build();
        }
    }

    /**
     * Map Stripe Payment Intent status to our internal status
     */
    private String mapStripeStatus(String stripeStatus) {
        return switch (stripeStatus) {
            case "succeeded" -> "SUCCESS";
            case "processing", "requires_action", "requires_payment_method", "requires_confirmation" -> "PENDING";
            case "canceled" -> "FAILED";
            default -> "PENDING";
        };
    }

    /**
     * Get user-friendly message based on status
     */
    private String getStatusMessage(String status) {
        return switch (status) {
            case "SUCCESS" -> "Payment processed successfully";
            case "PENDING" -> "Payment is being processed";
            case "FAILED" -> "Payment failed";
            default -> "Payment status unknown";
        };
    }
}
