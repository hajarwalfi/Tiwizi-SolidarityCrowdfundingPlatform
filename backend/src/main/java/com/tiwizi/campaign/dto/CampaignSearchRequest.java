package com.tiwizi.campaign.dto;

import com.tiwizi.enums.CampaignCategory;
import com.tiwizi.enums.CampaignStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CampaignSearchRequest {
    private String keyword;
    private CampaignCategory category;
    private CampaignStatus status;
    private String location;
    private Boolean isUrgent;
    private Boolean deadlineSoon;
    private Boolean nearlyFunded;
    private Integer page = 0;
    private Integer size = 10;
}
