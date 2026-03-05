package com.tiwizi.payment.controller;

import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.net.Webhook;
import com.tiwizi.campaign.repository.CampaignRepository;
import com.tiwizi.donation.repository.DonationRepository;
import com.tiwizi.entity.Campaign;
import com.tiwizi.entity.Donation;
import com.tiwizi.enums.CampaignStatus;
import com.tiwizi.enums.DonationStatus;
import com.tiwizi.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Stripe Webhook Controller
 * Handles payment events from Stripe
 */
@RestController
@RequestMapping("/api/webhooks/stripe")
@RequiredArgsConstructor
@Slf4j
public class StripeWebhookController {

    private final DonationRepository donationRepository;
    private final CampaignRepository campaignRepository;
    private final NotificationService notificationService;

    @Value("${stripe.webhook-secret}")
    private String webhookSecret;

    @PostMapping
    public ResponseEntity<String> handleStripeWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {

        log.info("📥 STRIPE WEBHOOK: Received event");

        Event event;

        try {
            // Verify webhook signature
            event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
            log.info("✅ STRIPE WEBHOOK: Signature verified | Event type: {}", event.getType());

        } catch (SignatureVerificationException e) {
            log.error("⚠️  STRIPE WEBHOOK: Invalid signature | Error: {}", e.getMessage());
            return ResponseEntity.status(400).body("Invalid signature");
        }

        // Handle the event
        switch (event.getType()) {
            case "payment_intent.succeeded":
                handlePaymentSuccess(event);
                break;

            case "payment_intent.payment_failed":
                handlePaymentFailure(event);
                break;

            case "payment_intent.processing":
                handlePaymentProcessing(event);
                break;

            default:
                log.info("ℹ️  STRIPE WEBHOOK: Unhandled event type: {}", event.getType());
        }

        return ResponseEntity.ok("Webhook received");
    }

    private void handlePaymentSuccess(Event event) {
        PaymentIntent paymentIntent = (PaymentIntent) event.getDataObjectDeserializer().getObject()
                .orElseThrow(() -> new RuntimeException("Failed to deserialize Stripe object"));
        String donationId = paymentIntent.getMetadata().get("donationId");

        log.info("✅ STRIPE WEBHOOK: Payment succeeded | Donation: {} | Transaction: {}",
                donationId, paymentIntent.getId());

        Donation donation = updateDonationStatus(donationId, paymentIntent.getId(), DonationStatus.SUCCESS);

        // Update campaign amount collected and check for auto-close
        if (donation != null) {
            updateCampaignFunding(donation);

            // Send notifications
            try {
                Campaign campaign = campaignRepository.findById(donation.getCampaign().getId()).orElse(null);
                if (campaign != null) {
                    notificationService.sendDonationConfirmation(donation.getDonor(), campaign, donation);
                    notificationService.sendNewDonationNotification(campaign.getCreator(), campaign, donation);
                }
            } catch (Exception e) {
                log.warn("⚠️ Webhook notification error (non-blocking): {}", e.getMessage());
            }
        }
    }

    private void handlePaymentFailure(Event event) {
        PaymentIntent paymentIntent = (PaymentIntent) event.getDataObjectDeserializer().getObject()
                .orElseThrow(() -> new RuntimeException("Failed to deserialize Stripe object"));
        String donationId = paymentIntent.getMetadata().get("donationId");

        log.error("❌ STRIPE WEBHOOK: Payment failed | Donation: {} | Transaction: {}",
                donationId, paymentIntent.getId());

        updateDonationStatus(donationId, paymentIntent.getId(), DonationStatus.FAILED);
    }

    private void handlePaymentProcessing(Event event) {
        PaymentIntent paymentIntent = (PaymentIntent) event.getDataObjectDeserializer().getObject()
                .orElseThrow(() -> new RuntimeException("Failed to deserialize Stripe object"));
        String donationId = paymentIntent.getMetadata().get("donationId");

        log.info("⏳ STRIPE WEBHOOK: Payment processing | Donation: {} | Transaction: {}",
                donationId, paymentIntent.getId());

        updateDonationStatus(donationId, paymentIntent.getId(), DonationStatus.PENDING);
    }

    private Donation updateDonationStatus(String donationId, String transactionId, DonationStatus status) {
        try {
            Donation donation = donationRepository.findById(donationId)
                    .orElseThrow(() -> new RuntimeException("Donation not found: " + donationId));

            donation.setStatus(status);
            donation.setPaymentTransactionId(transactionId);

            if (status == DonationStatus.SUCCESS) {
                donation.setPaidAt(LocalDateTime.now());
            }

            donationRepository.save(donation);

            log.info("💾 STRIPE WEBHOOK: Donation updated | ID: {} | Status: {}",
                    donationId, status);

            return donation;

        } catch (Exception e) {
            log.error("❌ STRIPE WEBHOOK: Failed to update donation | ID: {} | Error: {}",
                    donationId, e.getMessage());
            return null;
        }
    }

    /**
     * Update campaign funding and auto-close at 100% (PRD requirement)
     */
    private void updateCampaignFunding(Donation donation) {
        try {
            Campaign campaign = donation.getCampaign();
            if (campaign == null) {
                log.warn("⚠️  Campaign is null for donation: {}", donation.getId());
                return;
            }

            // Reload campaign to get latest data
            campaign = campaignRepository.findById(campaign.getId())
                    .orElseThrow(() -> new RuntimeException("Campaign not found"));

            // Add donation amount to campaign total
            BigDecimal newTotal = campaign.getAmountCollected().add(donation.getAmount());
            campaign.setAmountCollected(newTotal);

            // Auto-close at 100% - PRD: "Automatically close a campaign at 100%"
            if (campaign.getStatus() == CampaignStatus.ACTIVE && campaign.isFullyFunded()) {
                campaign.setStatus(CampaignStatus.CLOSED);
                campaign.setClosedAt(LocalDateTime.now());
                log.info("🎉 CAMPAIGN AUTO-CLOSED: Campaign {} reached 100% ({}/{} MAD)",
                        campaign.getId(), newTotal, campaign.getGoalAmount());

                // Notify beneficiary
                notificationService.sendGoalReachedNotification(campaign.getCreator(), campaign);

                // Notify all donors
                Campaign finalCampaign = campaign;
                donationRepository.findByCampaignId(campaign.getId()).stream()
                        .filter(d -> d.getStatus() == DonationStatus.SUCCESS)
                        .map(Donation::getDonor)
                        .distinct()
                        .forEach(donor -> notificationService.sendCampaignClosedNotification(donor, finalCampaign));
            }

            campaignRepository.save(campaign);
            log.info("💰 Campaign {} updated: {}/{} MAD ({}%)",
                    campaign.getId(), newTotal, campaign.getGoalAmount(),
                    campaign.getProgressPercentage());

        } catch (Exception e) {
            log.error("❌ Failed to update campaign funding for donation: {} | Error: {}",
                    donation.getId(), e.getMessage());
        }
    }
}

