package com.tiwizi.admin.dto;

import com.tiwizi.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserAdminResponse {

    private String id;
    private String email;
    private String fullName;
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private UserRole role;
    private Boolean isEmailVerified;
    private LocalDateTime createdAt;
    private LocalDateTime lastLoginAt;
    private boolean isDonor;
    private boolean isBeneficiary;
    private boolean isAdmin;
    private int totalCampaigns;
    private int totalDonations;
    private String profilePictureUrl;
    private Boolean isBanned;
    private String banReason;
    private LocalDateTime bannedAt;
}
