package com.tiwizi.payment.controller;

import com.tiwizi.donation.repository.DonationRepository;
import com.tiwizi.entity.Donation;
import com.tiwizi.entity.User;
import com.tiwizi.enums.DonationStatus;
import com.tiwizi.notification.service.NotificationService;
import com.tiwizi.payment.dto.PaymentRequest;
import com.tiwizi.payment.dto.PaymentResponse;
import com.tiwizi.payment.dto.SavedCardResponse;
import com.tiwizi.payment.dto.SetupIntentResponse;
import com.tiwizi.payment.service.PaymentService;
import com.tiwizi.payment.service.SavedCardService;
import com.tiwizi.campaign.repository.CampaignRepository;
import com.tiwizi.entity.Campaign;
import com.tiwizi.enums.CampaignStatus;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * Payment Controller
 * Handles payment-related endpoints
 */
@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final PaymentService paymentService;
    private final SavedCardService savedCardService;
    private final DonationRepository donationRepository;
    private final CampaignRepository campaignRepository;
    private final NotificationService notificationService;

    @PostMapping("/create-intent")
    public ResponseEntity<PaymentResponse> createPaymentIntent(@Valid @RequestBody PaymentRequest request) {
        log.info("POST /api/payments/create-intent - Donation: {}", request.getDonationId());
        PaymentResponse response = paymentService.processPayment(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/verify/{transactionId}")
    public ResponseEntity<PaymentResponse> verifyPayment(@PathVariable String transactionId) {
        log.info("GET /api/payments/verify/{}", transactionId);
        PaymentResponse response = paymentService.verifyPayment(transactionId);

        // Update donation status in DB based on Stripe's actual status
        if (response.getDonationId() != null) {
            try {
                Donation donation = donationRepository.findById(response.getDonationId()).orElse(null);
                if (donation != null && donation.getStatus() != DonationStatus.SUCCESS) {
                    DonationStatus newStatus = DonationStatus.valueOf(response.getStatus());
                    donation.setStatus(newStatus);
                    donation.setPaymentTransactionId(transactionId);
                    if (newStatus == DonationStatus.SUCCESS) {
                        donation.setPaidAt(LocalDateTime.now());
                    }
                    donationRepository.save(donation);
                    log.info("💾 Donation {} updated to {} via verify", donation.getId(), newStatus);

                    // Update campaign funding on success
                    if (newStatus == DonationStatus.SUCCESS) {
                        updateCampaignFunding(donation);

                        // Send notifications
                        try {
                            Campaign campaign = campaignRepository.findById(donation.getCampaign().getId()).orElse(null);
                            if (campaign != null) {
                                // Notify donor: donation confirmed
                                notificationService.sendDonationConfirmation(donation.getDonor(), campaign, donation);
                                // Notify beneficiary: new donation received
                                notificationService.sendNewDonationNotification(campaign.getCreator(), campaign, donation);
                            }
                        } catch (Exception notifErr) {
                            log.warn("⚠️ Notification error (non-blocking): {}", notifErr.getMessage());
                        }
                    }
                }
            } catch (Exception e) {
                log.error("❌ Failed to update donation after verify: {}", e.getMessage());
            }
        }

        return ResponseEntity.ok(response);
    }

    private void updateCampaignFunding(Donation donation) {
        try {
            Campaign campaign = campaignRepository.findById(donation.getCampaign().getId())
                    .orElse(null);
            if (campaign == null) return;

            BigDecimal newTotal = campaign.getAmountCollected().add(donation.getAmount());
            campaign.setAmountCollected(newTotal);

            if (campaign.getStatus() == CampaignStatus.ACTIVE && campaign.isFullyFunded()) {
                campaign.setStatus(CampaignStatus.CLOSED);
                campaign.setClosedAt(LocalDateTime.now());
                log.info("🎉 Campaign {} auto-closed at 100%", campaign.getId());

                // Notify beneficiary: goal reached
                notificationService.sendGoalReachedNotification(campaign.getCreator(), campaign);

                // Notify all donors that the campaign they supported is closed
                donationRepository.findByCampaignId(campaign.getId()).stream()
                        .filter(d -> d.getStatus() == DonationStatus.SUCCESS)
                        .map(Donation::getDonor)
                        .distinct()
                        .forEach(donor -> notificationService.sendCampaignClosedNotification(donor, campaign));
            }

            campaignRepository.save(campaign);
            log.info("💰 Campaign {} updated: {}/{} MAD", campaign.getId(), newTotal, campaign.getGoalAmount());
        } catch (Exception e) {
            log.error("❌ Failed to update campaign funding: {}", e.getMessage());
        }
    }

    // ── Saved card endpoints ──────────────────────────────────

    @PostMapping("/setup-intent")
    public ResponseEntity<SetupIntentResponse> createSetupIntent(
            @AuthenticationPrincipal User currentUser) {
        log.info("POST /api/payments/setup-intent - user: {}", currentUser.getEmail());
        try {
            SetupIntentResponse response = savedCardService.createSetupIntent(currentUser);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("❌ Failed to create SetupIntent: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/saved-card")
    public ResponseEntity<SavedCardResponse> getSavedCard(
            @AuthenticationPrincipal User currentUser) {
        log.info("GET /api/payments/saved-card - user: {}", currentUser.getEmail());
        try {
            SavedCardResponse card = savedCardService.getSavedCard(currentUser);
            if (card == null) {
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.ok(card);
        } catch (Exception e) {
            log.error("❌ Failed to retrieve saved card: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/enable-future-usage")
    public ResponseEntity<Void> enableFutureUsage(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal User currentUser) {
        String paymentIntentId = body.get("paymentIntentId");
        log.info("POST /api/payments/enable-future-usage - user: {}, pi: {}", currentUser.getEmail(), paymentIntentId);
        try {
            savedCardService.enableFutureUsageForPaymentIntent(currentUser, paymentIntentId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("❌ Failed to enable future usage: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/attach-payment-method")
    public ResponseEntity<Void> attachPaymentMethod(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal User currentUser) {
        String paymentMethodId = body.get("paymentMethodId");
        log.info("POST /api/payments/attach-payment-method - user: {}, pm: {}", currentUser.getEmail(), paymentMethodId);
        try {
            savedCardService.attachPaymentMethodToCustomer(currentUser, paymentMethodId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("❌ Failed to attach payment method: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/saved-card")
    public ResponseEntity<Void> deleteSavedCard(
            @AuthenticationPrincipal User currentUser) {
        log.info("DELETE /api/payments/saved-card - user: {}", currentUser.getEmail());
        try {
            savedCardService.deleteSavedCard(currentUser);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            log.error("❌ Failed to delete saved card: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
}
