package com.tiwizi.controller;

import com.tiwizi.campaign.controller.CampaignController;
import com.tiwizi.campaign.dto.CampaignDetailResponse;
import com.tiwizi.campaign.dto.CampaignResponse;
import com.tiwizi.auth.service.CustomUserDetailsService;
import com.tiwizi.auth.service.JwtService;
import com.tiwizi.campaign.service.CampaignService;
import com.tiwizi.config.SecurityConfig;
import com.tiwizi.config.WebMvcTestSecurityConfig;
import com.tiwizi.enums.CampaignCategory;
import com.tiwizi.enums.CampaignStatus;
import com.tiwizi.exception.ResourceNotFoundException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(
        value = CampaignController.class,
        excludeFilters = @ComponentScan.Filter(
                type = FilterType.ASSIGNABLE_TYPE,
                classes = SecurityConfig.class
        )
)
@Import(WebMvcTestSecurityConfig.class)
class CampaignControllerTest {

    @Autowired MockMvc mockMvc;

    @MockitoBean CampaignService campaignService;
    @MockitoBean JwtService jwtService;
    @MockitoBean CustomUserDetailsService userDetailsService;

    private CampaignResponse buildCampaignResponse(String id, String title) {
        return CampaignResponse.builder()
                .id(id)
                .title(title)
                .goalAmount(new BigDecimal("5000.00"))
                .amountCollected(BigDecimal.ZERO)
                .status(CampaignStatus.ACTIVE)
                .category(CampaignCategory.EDUCATION)
                .location("Casablanca")
                .build();
    }

    @Test
    void getAllCampaigns_shouldReturn200WithArray() throws Exception {
        when(campaignService.getAllCampaigns()).thenReturn(List.of(
                buildCampaignResponse("c1", "First Campaign"),
                buildCampaignResponse("c2", "Second Campaign")
        ));

        mockMvc.perform(get("/api/campaigns"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].title").value("First Campaign"));
    }

    @Test
    void getAllCampaigns_shouldReturn200WithEmptyArrayWhenNoCampaigns() throws Exception {
        when(campaignService.getAllCampaigns()).thenReturn(List.of());

        mockMvc.perform(get("/api/campaigns"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void getCampaignById_shouldReturn200WithCampaignDetails() throws Exception {
        CampaignDetailResponse detail = CampaignDetailResponse.builder()
                .id("camp-1")
                .title("Test Campaign")
                .status(CampaignStatus.ACTIVE)
                .build();
        when(campaignService.getCampaignById("camp-1")).thenReturn(detail);

        mockMvc.perform(get("/api/campaigns/camp-1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("camp-1"))
                .andExpect(jsonPath("$.title").value("Test Campaign"));
    }

    @Test
    void getCampaignById_shouldReturn404WhenNotFound() throws Exception {
        when(campaignService.getCampaignById("missing")).thenThrow(
                new ResourceNotFoundException("Campaign not found with id: missing"));

        mockMvc.perform(get("/api/campaigns/missing"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Campaign not found with id: missing"));
    }

    @Test
    void searchCampaigns_shouldReturn200WithPagedResults() throws Exception {
        var page = new PageImpl<>(
                List.of(buildCampaignResponse("c1", "Education Drive")),
                PageRequest.of(0, 10),
                1
        );
        when(campaignService.searchCampaigns(any())).thenReturn(page);

        mockMvc.perform(get("/api/campaigns/search")
                        .param("keyword", "education")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content[0].title").value("Education Drive"));
    }
}
