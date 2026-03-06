package com.tiwizi.favorite.dto;

import com.tiwizi.campaign.dto.CampaignResponse;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FavoriteResponse {
    private String id;
    private CampaignResponse campaign;
    private LocalDateTime createdAt;
}
