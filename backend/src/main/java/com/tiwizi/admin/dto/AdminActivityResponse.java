package com.tiwizi.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminActivityResponse {
    private String id;
    /** NEW_CAMPAIGN | REPORT | NEW_USER | CAMPAIGN_CLOSING | CAMPAIGN_FUNDED */
    private String type;
    private String title;
    private String description;
    private LocalDateTime createdAt;
    private String relatedEntityId;
}
