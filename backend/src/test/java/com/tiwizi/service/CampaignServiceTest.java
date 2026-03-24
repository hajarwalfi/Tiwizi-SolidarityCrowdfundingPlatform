package com.tiwizi.service;

import com.tiwizi.campaign.dto.CampaignDetailResponse;
import com.tiwizi.campaign.mapper.CampaignMapper;
import com.tiwizi.campaign.repository.CampaignRepository;
import com.tiwizi.campaign.repository.CampaignUpdateRepository;
import com.tiwizi.campaign.service.CampaignService;
import com.tiwizi.entity.Campaign;
import com.tiwizi.enums.CampaignCategory;
import com.tiwizi.enums.CampaignStatus;
import com.tiwizi.exception.ResourceNotFoundException;
import com.tiwizi.exception.UnauthorizedAccessException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CampaignServiceTest {

    @Mock CampaignRepository campaignRepository;
    @Mock CampaignUpdateRepository campaignUpdateRepository;
    @Mock CampaignMapper campaignMapper;

    @InjectMocks CampaignService campaignService;

    private Campaign buildCampaign(CampaignStatus status) {
        Campaign c = new Campaign();
        c.setTitle("Test Campaign");
        c.setDescription("Helping the community");
        c.setGoalAmount(new BigDecimal("5000.00"));
        c.setAmountCollected(BigDecimal.ZERO);
        c.setCategory(CampaignCategory.EDUCATION);
        c.setLocation("Casablanca");
        c.setStatus(status);
        c.setIsUrgent(false);
        return c;
    }

    @Test
    void getAllCampaigns_shouldReturnMappedList() {
        Campaign campaign = buildCampaign(CampaignStatus.ACTIVE);
        when(campaignRepository.findAll()).thenReturn(List.of(campaign));

        var result = campaignService.getAllCampaigns();

        assertThat(result).hasSize(1);
        verify(campaignRepository).findAll();
        verify(campaignMapper).toResponse(campaign);
    }

    @Test
    void getAllCampaigns_shouldReturnEmptyListWhenNoCampaigns() {
        when(campaignRepository.findAll()).thenReturn(List.of());

        assertThat(campaignService.getAllCampaigns()).isEmpty();
    }

    @Test
    void getCampaignById_shouldCallMapperWithFoundCampaign() {
        Campaign campaign = buildCampaign(CampaignStatus.ACTIVE);
        CampaignDetailResponse expected = CampaignDetailResponse.builder()
                .title("Test Campaign").build();
        when(campaignRepository.findById("camp-1")).thenReturn(Optional.of(campaign));
        when(campaignMapper.toDetailResponse(campaign)).thenReturn(expected);

        var result = campaignService.getCampaignById("camp-1");

        assertThat(result.getTitle()).isEqualTo("Test Campaign");
    }

    @Test
    void getCampaignById_shouldThrowResourceNotFoundWhenMissing() {
        when(campaignRepository.findById("missing")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> campaignService.getCampaignById("missing"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Campaign not found");
    }

    @Test
    void getCampaignById_shouldThrowUnauthorizedForSuspendedCampaign() {
        Campaign campaign = buildCampaign(CampaignStatus.SUSPENDED);
        when(campaignRepository.findById("susp-1")).thenReturn(Optional.of(campaign));

        assertThatThrownBy(() -> campaignService.getCampaignById("susp-1"))
                .isInstanceOf(UnauthorizedAccessException.class)
                .hasMessageContaining("suspended");
    }

    @Test
    void getCampaignById_shouldThrowIllegalArgumentForNullId() {
        assertThatThrownBy(() -> campaignService.getCampaignById(null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("null");
    }

    @Test
    void getCampaignUpdates_shouldThrowWhenCampaignNotFound() {
        when(campaignRepository.existsById("ghost")).thenReturn(false);

        assertThatThrownBy(() -> campaignService.getCampaignUpdates("ghost"))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void getCampaignUpdates_shouldReturnEmptyListWhenNoUpdates() {
        when(campaignRepository.existsById("camp-1")).thenReturn(true);
        when(campaignUpdateRepository.findByCampaignIdOrderByCreatedAtDesc("camp-1"))
                .thenReturn(List.of());

        var result = campaignService.getCampaignUpdates("camp-1");

        assertThat(result).isEmpty();
    }
}
