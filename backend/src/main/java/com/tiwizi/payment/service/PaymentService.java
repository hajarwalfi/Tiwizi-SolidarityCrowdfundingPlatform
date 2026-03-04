package com.tiwizi.payment.service;

import com.tiwizi.payment.dto.PaymentRequest;
import com.tiwizi.payment.dto.PaymentResponse;

public interface PaymentService {
    /**
     * Process a payment for a donation
     */
    PaymentResponse processPayment(PaymentRequest request);

    /**
     * Verify payment status
     */
    PaymentResponse verifyPayment(String transactionId);
}
