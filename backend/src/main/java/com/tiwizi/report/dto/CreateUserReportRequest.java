package com.tiwizi.report.dto;

import com.tiwizi.enums.ReportReason;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateUserReportRequest {

    @NotNull(message = "Reason is required")
    private ReportReason reason;

    private String description;
}
