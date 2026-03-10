package com.tiwizi.admin.dto;

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
public class ReportAdminResponse {

    private String id;
    private String reportType; // CAMPAIGN or USER

    // Campaign report fields
    private String campaignId;
    private String campaignTitle;

    // User report fields
    private String reportedUserId;
    private String reportedUserName;

    private String reporterId;
    private String reporterEmail;
    private String reporterName;
    private ReportReason reason;
    private String description;
    private ReportStatus status;
    private LocalDateTime createdAt;
}
