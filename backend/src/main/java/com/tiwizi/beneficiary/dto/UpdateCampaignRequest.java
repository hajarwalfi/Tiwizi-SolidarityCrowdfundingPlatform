package com.tiwizi.beneficiary.dto;

import com.tiwizi.enums.CampaignCategory;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateCampaignRequest {

    @Size(min = 10, max = 200, message = "Title must be between 10 and 200 characters")
    private String title;

    @Size(min = 50, message = "Description must be at least 50 characters")
    private String description;

    @DecimalMin(value = "100.0", message = "Goal amount must be at least 100 MAD")
    private BigDecimal goalAmount;

    private CampaignCategory category;

    @Size(max = 100, message = "Location must not exceed 100 characters")
    private String location;

    private Boolean isUrgent;

    private LocalDate deadline;

    @Size(max = 100, message = "RIB number must not exceed 100 characters")
    private String ribNumber;

    @Size(max = 30, message = "Phone must not exceed 30 characters")
    private String phone;

    @Email(message = "Contact email must be valid")
    @Size(max = 255, message = "Contact email must not exceed 255 characters")
    private String contactEmail;

    @Size(max = 255)
    private String facebook;

    @Size(max = 255)
    private String instagram;

    @Size(max = 255)
    private String twitter;

    @Size(max = 255)
    private String website;
}