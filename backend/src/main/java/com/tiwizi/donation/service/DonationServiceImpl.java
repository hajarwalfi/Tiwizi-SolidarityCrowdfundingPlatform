package com.tiwizi.donation.service;

import com.tiwizi.campaign.repository.CampaignRepository;
import com.tiwizi.donation.dto.DonationRequest;
import com.tiwizi.donation.dto.DonationResponse;
import com.tiwizi.donation.mapper.DonationMapper;
import com.tiwizi.donation.repository.DonationRepository;
import com.tiwizi.entity.Campaign;
import com.tiwizi.entity.Donation;
import com.tiwizi.entity.User;
import com.tiwizi.enums.DonationStatus;
import com.tiwizi.payment.dto.PaymentRequest;
import com.tiwizi.payment.dto.PaymentResponse;
import com.tiwizi.payment.service.PaymentService;
import com.tiwizi.payment.service.SavedCardService;
import com.tiwizi.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DonationServiceImpl implements DonationService {

    private final DonationRepository donationRepository;
    private final CampaignRepository campaignRepository;
    private final UserRepository userRepository;
    private final DonationMapper donationMapper;
    private final PaymentService paymentService;
    private final SavedCardService savedCardService;

    @Override
    @Transactional
    public DonationResponse createDonation(DonationRequest request, String donorEmail) {
        log.info("Creating donation for campaign: {} by user: {}", request.getCampaignId(), donorEmail);

        Campaign campaign = campaignRepository.findById(request.getCampaignId())
                .orElseThrow(() -> new RuntimeException("Campaign not found"));

        User donor = userRepository.findByEmail(donorEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Create donation entity with PENDING status
        Donation donation = donationMapper.toEntity(request);
        donation.setCampaign(campaign);
        donation.setDonor(donor);
        donation.setStatus(DonationStatus.PENDING);

        // Save donation first to get ID
        Donation savedDonation = donationRepository.save(donation);
        log.info("Donation created with ID: {} | Status: PENDING", savedDonation.getId());

        // Create Payment Intent (but don't process yet - frontend will handle payment)
        String clientSecret = null;
        try {
            PaymentRequest.PaymentRequestBuilder paymentRequestBuilder = PaymentRequest.builder()
                    .donationId(savedDonation.getId())
                    .amount(savedDonation.getAmount())
                    .paymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "CARD");

            // If the donor has a saved card, attach customer + payment method for off-session charge
            if (donor.getStripeCustomerId() != null) {
                try {
                    String pmId = savedCardService.getDefaultPaymentMethodId(donor);
                    if (pmId != null) {
                        paymentRequestBuilder
                                .stripeCustomerId(donor.getStripeCustomerId())
                                .stripePaymentMethodId(pmId);
                        log.info("💳 Using saved card for donation: {}", savedDonation.getId());
                    }
                } catch (Exception e) {
                    log.warn("⚠️ Could not retrieve saved card, falling back to manual entry: {}", e.getMessage());
                }
            }

            PaymentRequest paymentRequest = paymentRequestBuilder.build();

            log.info("💳 Creating Payment Intent for donation: {}", savedDonation.getId());
            PaymentResponse paymentResponse = paymentService.processPayment(paymentRequest);

            // If Stripe failed, surface the error immediately
            if ("FAILED".equals(paymentResponse.getStatus())) {
                throw new RuntimeException(paymentResponse.getMessage() != null
                        ? paymentResponse.getMessage()
                        : "Payment processing failed");
            }

            // Store the Payment Intent ID (client secret) for frontend
            clientSecret = paymentResponse.getClientSecret();
            savedDonation.setPaymentTransactionId(paymentResponse.getTransactionId());

            // If payment was immediately confirmed (saved card), update donation status
            if ("SUCCESS".equals(paymentResponse.getStatus())) {
                savedDonation.setStatus(DonationStatus.SUCCESS);
                savedDonation.setPaidAt(paymentResponse.getProcessedAt());
                log.info("✅ Payment auto-confirmed with saved card for donation: {}", savedDonation.getId());
            }

            donationRepository.save(savedDonation);

            log.info("✅ Payment Intent created: {} | Client secret ready for frontend", paymentResponse.getTransactionId());

        } catch (Exception e) {
            log.error("❌ Payment Intent creation error for donation: {}", savedDonation.getId(), e);
            savedDonation.setStatus(DonationStatus.FAILED);
            donationRepository.save(savedDonation);
            throw new RuntimeException("Payment Intent creation failed: " + e.getMessage());
        }

        // Return donation with client secret for frontend to process payment
        DonationResponse response = donationMapper.toResponse(savedDonation);
        response.setTransactionId(clientSecret); // This is the client secret for Stripe Elements
        response.setPaidWithSavedCard(savedDonation.getStatus() == DonationStatus.SUCCESS);
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public List<DonationResponse> getDonationsByCampaign(String campaignId) {
        return donationRepository.findByCampaignId(campaignId).stream()
                .map(donationMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<DonationResponse> getMyDonations(String donorEmail) {
        User donor = userRepository.findByEmail(donorEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return donationRepository.findByDonorId(donor.getId()).stream()
                .map(donationMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public DonationResponse getDonationById(String id) {
        return donationRepository.findById(id)
                .map(donationMapper::toResponse)
                .orElseThrow(() -> new RuntimeException("Donation not found"));
    }
}
