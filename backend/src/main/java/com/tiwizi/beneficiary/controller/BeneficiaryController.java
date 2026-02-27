package com.tiwizi.beneficiary.controller;

import com.tiwizi.beneficiary.dto.*;
import com.tiwizi.beneficiary.service.BeneficiaryService;
import com.tiwizi.entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/beneficiary")
@RequiredArgsConstructor
public class BeneficiaryController {

    private final BeneficiaryService beneficiaryService;

    @GetMapping("/campaigns")
    public ResponseEntity<List<BeneficiaryCampaignResponse>> getMyCampaigns(
            @AuthenticationPrincipal User currentUser) {
        List<BeneficiaryCampaignResponse> campaigns = beneficiaryService.getMyCampaigns(currentUser);
        return ResponseEntity.ok(campaigns);
    }

    @PostMapping("/campaigns")
    public ResponseEntity<BeneficiaryCampaignResponse> createCampaign(
            @Valid @RequestBody CreateCampaignRequest request,
            @AuthenticationPrincipal User currentUser) {
        BeneficiaryCampaignResponse campaign = beneficiaryService.createCampaign(request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(campaign);
    }

    @PutMapping("/campaigns/{id}")
    public ResponseEntity<BeneficiaryCampaignResponse> updateCampaign(
            @PathVariable String id,
            @Valid @RequestBody UpdateCampaignRequest request,
            @AuthenticationPrincipal User currentUser) {
        BeneficiaryCampaignResponse campaign = beneficiaryService.updateCampaign(id, request, currentUser);
        return ResponseEntity.ok(campaign);
    }

    @GetMapping("/dashboard/stats")
    public ResponseEntity<BeneficiaryDashboardStatsResponse> getDashboardStats(
            @AuthenticationPrincipal User currentUser) {
        BeneficiaryDashboardStatsResponse stats = beneficiaryService.getDashboardStats(currentUser);
        return ResponseEntity.ok(stats);
    }

    @DeleteMapping("/campaigns/{id}")
    public ResponseEntity<Void> deleteCampaign(
            @PathVariable String id,
            @AuthenticationPrincipal User currentUser) {
        beneficiaryService.deleteCampaign(id, currentUser);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/campaigns/{id}/archive")
    public ResponseEntity<BeneficiaryCampaignResponse> archiveCampaign(
            @PathVariable String id,
            @AuthenticationPrincipal User currentUser) {
        BeneficiaryCampaignResponse campaign = beneficiaryService.archiveCampaign(id, currentUser);
        return ResponseEntity.ok(campaign);
    }

    @PatchMapping("/campaigns/{id}/unarchive")
    public ResponseEntity<BeneficiaryCampaignResponse> unarchiveCampaign(
            @PathVariable String id,
            @AuthenticationPrincipal User currentUser) {
        BeneficiaryCampaignResponse campaign = beneficiaryService.unarchiveCampaign(id, currentUser);
        return ResponseEntity.ok(campaign);
    }

    // Image Upload for Campaign Updates

    @PostMapping(value = "/upload/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadUpdateImage(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal User currentUser) {
        String url = beneficiaryService.uploadUpdateImage(file, currentUser);
        return ResponseEntity.ok(Map.of("url", url));
    }

    // Campaign Document Endpoints

    @PostMapping(value = "/campaigns/{id}/documents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<BeneficiaryCampaignResponse.DocumentResponse> uploadCampaignDocument(
            @PathVariable String id,
            @RequestParam("file") MultipartFile file,
            @RequestParam("documentType") String documentType,
            @AuthenticationPrincipal User currentUser) {
        var doc = beneficiaryService.uploadCampaignDocument(id, file, documentType, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(doc);
    }

    @DeleteMapping("/campaigns/{id}/documents/{docId}")
    public ResponseEntity<Void> deleteCampaignDocument(
            @PathVariable String id,
            @PathVariable String docId,
            @AuthenticationPrincipal User currentUser) {
        beneficiaryService.deleteCampaignDocument(id, docId, currentUser);
        return ResponseEntity.noContent().build();
    }

    // Campaign Updates Endpoints

    @PostMapping("/campaigns/{campaignId}/updates")
    public ResponseEntity<CampaignUpdateResponse> createCampaignUpdate(
            @PathVariable String campaignId,
            @Valid @RequestBody CreateCampaignUpdateRequest request,
            @AuthenticationPrincipal User currentUser) {
        CampaignUpdateResponse update = beneficiaryService.createCampaignUpdate(campaignId, request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(update);
    }

    @GetMapping("/campaigns/{campaignId}/updates")
    public ResponseEntity<List<CampaignUpdateResponse>> getCampaignUpdates(
            @PathVariable String campaignId,
            @AuthenticationPrincipal User currentUser) {
        List<CampaignUpdateResponse> updates = beneficiaryService.getCampaignUpdates(campaignId, currentUser);
        return ResponseEntity.ok(updates);
    }

    @DeleteMapping("/campaigns/{campaignId}/updates/{updateId}")
    public ResponseEntity<Void> deleteCampaignUpdate(
            @PathVariable String campaignId,
            @PathVariable String updateId,
            @AuthenticationPrincipal User currentUser) {
        beneficiaryService.deleteCampaignUpdate(campaignId, updateId, currentUser);
        return ResponseEntity.noContent().build();
    }
}