package com.tiwizi.user.profile.dto;

import com.tiwizi.enums.AuthProvider;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {

    private String id;
    private String email;
    private String fullName;
    private String firstName;
    private String lastName;
    private String displayName;
    private String phoneNumber;
    private String profilePictureUrl;
    private String backgroundPictureUrl;
    private String bio;
    private Boolean isProfilePublic;

    // Social links
    private String facebookUrl;
    private String twitterUrl;
    private String instagramUrl;
    private String linkedinUrl;
    private String websiteUrl;

    private AuthProvider authProvider;
    private Boolean isEmailVerified;
    private Boolean googleLinked;
    private LocalDateTime createdAt;
    private LocalDateTime lastLoginAt;

    // Behavioral flags (what users actually care about)
    private Boolean isDonor;       // Have I donated to others?
    private Boolean isBeneficiary; // Have I created campaigns?
    private Boolean isAdmin;       // Am I an admin? (for showing admin panel)

    // User statistics
    private Integer campaignsCreated;
    private Integer activeCampaigns;
    private Integer donationsMade;
    private Integer totalDonationsReceived;
}
