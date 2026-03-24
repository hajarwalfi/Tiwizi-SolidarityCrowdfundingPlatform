package com.tiwizi.user.profile.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicUserProfileResponse {

    private String id;
    private String fullName;
    private String firstName;
    private String displayName;
    private String profilePictureUrl;
    private String backgroundPictureUrl;
    private String bio;
    private LocalDateTime createdAt;

    // Social links (only shown if profile is public)
    private String facebookUrl;
    private String twitterUrl;
    private String instagramUrl;
    private String linkedinUrl;
    private String websiteUrl;

    // Public statistics only
    private Integer campaignsCreated;
    private Integer activeCampaigns;
    private Integer donationsMade;
    private String topSupportedCategory;

    // Ban status
    private Boolean isBanned;
    private String banReason;
}