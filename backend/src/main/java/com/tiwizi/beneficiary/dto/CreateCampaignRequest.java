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
public class CreateCampaignRequest {

    @NotBlank(message = "Title is required")
    @Size(min = 10, max = 200, message = "Title must be between 10 and 200 characters")
    private String title;

    @NotBlank(message = "Description is required")
    @Size(min = 50, message = "Description must be at least 50 characters")
    private String description;

    @NotNull(message = "Goal amount is required")
    @DecimalMin(value = "100.0", message = "Goal amount must be at least 100 MAD")
    private BigDecimal goalAmount;

    @NotNull(message = "Category is required")
    private CampaignCategory category;

    @NotBlank(message = "Location is required")
    @Size(max = 100, message = "Location mcust not exceed 100 characters")
    private String location;

    @Builder.Default
    private Boolean isUrgent = false;

    private LocalDate deadline;

    @NotBlank(message = "RIB number is required")
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