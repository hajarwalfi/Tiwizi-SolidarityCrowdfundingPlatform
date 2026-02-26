package com.tiwizi.beneficiary.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateCampaignUpdateRequest {

    @NotBlank(message = "Content is required")
    private String content;

    private String photoUrls; // Comma-separated URLs or JSON array
}