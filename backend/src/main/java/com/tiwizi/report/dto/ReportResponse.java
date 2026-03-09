package com.tiwizi.report.dto;

import com.tiwizi.enums.ReportReason;
import com.tiwizi.enums.ReportStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportResponse {
    private String id;
    private String reportType;
    private String campaignId;
    private String campaignTitle;
    private String reportedUserId;
    private String reportedUserName;
    private ReportReason reason;
    private String description;
    private ReportStatus status;
    private LocalDateTime createdAt;
}
