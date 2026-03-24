package com.tiwizi.campaign.service;

import com.tiwizi.beneficiary.dto.CampaignUpdateResponse;
import com.tiwizi.campaign.dto.CampaignDetailResponse;
import com.tiwizi.campaign.dto.CampaignResponse;
import com.tiwizi.campaign.dto.CampaignSearchRequest;
import com.tiwizi.campaign.mapper.CampaignMapper;
import com.tiwizi.campaign.repository.CampaignRepository;
import com.tiwizi.campaign.repository.CampaignUpdateRepository;
import com.tiwizi.entity.Campaign;
import com.tiwizi.entity.CampaignUpdate;
import com.tiwizi.enums.CampaignCategory;
import com.tiwizi.exception.ResourceNotFoundException;
import com.tiwizi.exception.UnauthorizedAccessException;
import com.tiwizi.enums.CampaignStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CampaignService {

    private final CampaignRepository campaignRepository;
    private final CampaignUpdateRepository campaignUpdateRepository;
    private final CampaignMapper campaignMapper;

    /**
     * Retrieves all campaigns from the database
     * @return List of CampaignResponse DTOs
     */
    @Transactional(readOnly = true)
    public List<CampaignResponse> getAllCampaigns() {
        log.info("Fetching all campaigns from database");
        
        List<Campaign> campaigns = campaignRepository.findAll();
        
        log.info("Found {} campaigns", campaigns.size());
        
        return campaigns.stream()
                .map(campaignMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Retrieves a single campaign by its ID with full details
     * @param id The campaign ID
     * @return CampaignDetailResponse DTO
     */
    @Transactional(readOnly = true)
    public CampaignDetailResponse getCampaignById(String id) {
        if (id == null) {
            throw new IllegalArgumentException("Id cannot be null");
        }
        log.info("Fetching campaign with id: {}", id);

        Campaign campaign = campaignRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign not found with id: " + id));

        if (campaign.getStatus() == CampaignStatus.SUSPENDED) {
            throw new UnauthorizedAccessException("This campaign has been suspended pending review.");
        }

        return campaignMapper.toDetailResponse(campaign);
    }

    /**
     * Search campaigns with filters and pagination
     * @param searchRequest The search criteria
     * @return Page of CampaignResponse DTOs
     */
    @Transactional(readOnly = true)
    public Page<CampaignResponse> searchCampaigns(CampaignSearchRequest searchRequest) {
        log.info("Searching campaigns with criteria: {}", searchRequest);

        Pageable pageable = PageRequest.of(
                searchRequest.getPage() != null ? searchRequest.getPage() : 0,
                searchRequest.getSize() != null ? searchRequest.getSize() : 10
                // Sort is already defined in the native SQL query
        );

        Page<Campaign> campaigns = campaignRepository.searchCampaigns(
                searchRequest.getKeyword(),
                searchRequest.getCategory() != null ? searchRequest.getCategory().name() : null,
                searchRequest.getStatus() != null ? searchRequest.getStatus().name() : null,
                searchRequest.getLocation(),
                searchRequest.getIsUrgent(),
                searchRequest.getDeadlineSoon(),
                searchRequest.getNearlyFunded(),
                pageable
        );

        log.info("Found {} campaigns matching criteria", campaigns.getTotalElements());

        return campaigns.map(campaignMapper::toResponse);
    }

    /**
     * Get campaigns by category
     * @param category The campaign category
     * @param page Page number
     * @param size Page size
     * @return Page of CampaignResponse DTOs
     */
    @Transactional(readOnly = true)
    public Page<CampaignResponse> getCampaignsByCategory(CampaignCategory category, int page, int size) {
        log.info("Fetching campaigns by category: {}", category);

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Campaign> campaigns = campaignRepository.findByCategory(category, pageable);

        log.info("Found {} campaigns in category {}", campaigns.getTotalElements(), category);

        return campaigns.map(campaignMapper::toResponse);
    }

    /**
     * Get updates for a campaign
     * @param campaignId The campaign ID
     * @return List of CampaignUpdateResponse DTOs
     */
    @Transactional(readOnly = true)
    public List<CampaignUpdateResponse> getCampaignUpdates(String campaignId) {
        log.info("Fetching updates for campaign: {}", campaignId);

        // Verify campaign exists
        if (!campaignRepository.existsById(campaignId)) {
            throw new ResourceNotFoundException("Campaign not found with id: " + campaignId);
        }

        List<CampaignUpdate> updates = campaignUpdateRepository.findByCampaignIdOrderByCreatedAtDesc(campaignId);
        log.info("Found {} updates for campaign {}", updates.size(), campaignId);

        return updates.stream()
                .map(this::toCampaignUpdateResponse)
                .collect(Collectors.toList());
    }

    private CampaignUpdateResponse toCampaignUpdateResponse(CampaignUpdate update) {
        return CampaignUpdateResponse.builder()
                .id(update.getId())
                .campaignId(update.getCampaign().getId())
                .content(update.getContent())
                .photoUrls(update.getPhotoUrls())
                .createdAt(update.getCreatedAt())
                .build();
    }
}
