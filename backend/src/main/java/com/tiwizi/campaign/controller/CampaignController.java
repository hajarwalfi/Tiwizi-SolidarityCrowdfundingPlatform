package com.tiwizi.campaign.controller;

import com.tiwizi.beneficiary.dto.CampaignUpdateResponse;
import com.tiwizi.campaign.dto.CampaignDetailResponse;
import com.tiwizi.campaign.dto.CampaignResponse;
import com.tiwizi.campaign.dto.CampaignSearchRequest;
import com.tiwizi.campaign.service.CampaignService;
import com.tiwizi.enums.CampaignCategory;
import com.tiwizi.enums.CampaignStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/campaigns")
@RequiredArgsConstructor
@Slf4j
public class CampaignController {

    private final CampaignService campaignService;

    @GetMapping
    public ResponseEntity<List<CampaignResponse>> getAllCampaigns() {
        log.info("GET /api/campaigns - Fetching all campaigns");
        return ResponseEntity.ok(campaignService.getAllCampaigns());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CampaignDetailResponse> getCampaignById(@PathVariable String id) {
        log.info("GET /api/campaigns/{} - Fetching campaign details", id);
        return ResponseEntity.ok(campaignService.getCampaignById(id));
    }

    @GetMapping("/search")
    public ResponseEntity<Page<CampaignResponse>> searchCampaigns(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) CampaignCategory category,
            @RequestParam(required = false) CampaignStatus status,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Boolean isUrgent,
            @RequestParam(required = false) Boolean deadlineSoon,
            @RequestParam(required = false) Boolean nearlyFunded,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "10") Integer size) {
        log.info("GET /api/campaigns/search - keyword:{} category:{} status:{} location:{} isUrgent:{} deadlineSoon:{} nearlyFunded:{}",
                keyword, category, status, location, isUrgent, deadlineSoon, nearlyFunded);

        CampaignSearchRequest searchRequest = new CampaignSearchRequest(
                keyword, category, status, location, isUrgent, deadlineSoon, nearlyFunded, page, size
        );

        return ResponseEntity.ok(campaignService.searchCampaigns(searchRequest));
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<Page<CampaignResponse>> getCampaignsByCategory(
            @PathVariable CampaignCategory category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.info("GET /api/campaigns/category/{} - Fetching campaigns by category", category);
        return ResponseEntity.ok(campaignService.getCampaignsByCategory(category, page, size));
    }

    @GetMapping("/{id}/updates")
    public ResponseEntity<List<CampaignUpdateResponse>> getCampaignUpdates(@PathVariable String id) {
        log.info("GET /api/campaigns/{}/updates - Fetching campaign updates", id);
        return ResponseEntity.ok(campaignService.getCampaignUpdates(id));
    }
}
