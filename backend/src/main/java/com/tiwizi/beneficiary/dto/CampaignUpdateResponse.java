package com.tiwizi.beneficiary.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CampaignUpdateResponse {

    private String id;
    private String campaignId;
    private String content;
    private String photoUrls;
    private LocalDateTime createdAt;
}