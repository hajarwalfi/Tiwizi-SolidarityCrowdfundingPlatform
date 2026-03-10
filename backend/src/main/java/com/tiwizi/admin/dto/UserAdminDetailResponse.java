package com.tiwizi.admin.dto;

import com.tiwizi.campaign.dto.CampaignResponse;
import com.tiwizi.donation.dto.DonationResponse;
import com.tiwizi.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserAdminDetailResponse {

    private String id;
    private String email;
    private String fullName;
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private String profilePictureUrl;
    private UserRole role;

    private Boolean isEmailVerified;
    private boolean isDonor;
    private boolean isBeneficiary;
    private boolean isAdmin;

    private LocalDateTime createdAt;
    private LocalDateTime lastLoginAt;

    private Boolean isBanned;
    private String banReason;
    private LocalDateTime bannedAt;

    private int totalCampaigns;
    private int totalDonations;
    private BigDecimal totalAmountDonated;

    private List<CampaignResponse> campaigns;
    private List<DonationResponse> donations;
}
