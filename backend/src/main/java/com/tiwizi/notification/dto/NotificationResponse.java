package com.tiwizi.notification.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    private String id;
    private String type;
    private String message;
    private String relatedEntityId;
    @JsonProperty("isRead")
    private boolean isRead;
    private LocalDateTime createdAt;
    private LocalDateTime readAt;
}
