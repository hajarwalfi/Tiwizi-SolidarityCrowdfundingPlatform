package com.tiwizi.donation.controller;

import com.tiwizi.donation.dto.DonationRequest;
import com.tiwizi.donation.dto.DonationResponse;
import com.tiwizi.donation.service.DonationService;
import com.tiwizi.entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/donations")
@RequiredArgsConstructor
@Slf4j
public class DonationController {

    private final DonationService donationService;
    private final com.tiwizi.donation.service.ReceiptService receiptService;

    @PostMapping
    public ResponseEntity<DonationResponse> createDonation(
            @Valid @RequestBody DonationRequest request,
            @AuthenticationPrincipal User currentUser) {
        log.info("POST /api/donations - Creating new donation for campaign: {}", request.getCampaignId());
        return ResponseEntity.ok(donationService.createDonation(request, currentUser.getEmail()));
    }

    @GetMapping("/campaign/{campaignId}")
    public ResponseEntity<List<DonationResponse>> getDonationsByCampaign(@PathVariable String campaignId) {
        log.info("GET /api/donations/campaign/{} - Fetching donations", campaignId);
        return ResponseEntity.ok(donationService.getDonationsByCampaign(campaignId));
    }

    @GetMapping("/my")
    public ResponseEntity<List<DonationResponse>> getMyDonations(@AuthenticationPrincipal User currentUser) {
        log.info("GET /api/donations/my - Fetching donations for user: {}", currentUser.getEmail());
        return ResponseEntity.ok(donationService.getMyDonations(currentUser.getEmail()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DonationResponse> getDonationById(@PathVariable String id) {
        log.info("GET /api/donations/{} - Fetching donation details", id);
        return ResponseEntity.ok(donationService.getDonationById(id));
    }

    @GetMapping("/{id}/receipt")
    public ResponseEntity<byte[]> downloadReceipt(@PathVariable String id) throws java.io.IOException {
        log.info("GET /api/donations/{}/receipt - Generating PDF receipt", id);
        byte[] pdf = receiptService.generateDonationReceipt(id);
        
        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"tiwizi_recu_" + id + ".pdf\"")
                .contentType(org.springframework.http.MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}
