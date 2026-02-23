package com.tiwizi.user.profile.service;

import com.tiwizi.campaign.repository.CampaignRepository;
import com.tiwizi.entity.Campaign;
import com.tiwizi.entity.User;
import com.tiwizi.enums.AuthProvider;
import com.tiwizi.enums.CampaignStatus;
import com.tiwizi.enums.DonationStatus;
import com.tiwizi.exception.ResourceNotFoundException;
import com.tiwizi.user.profile.dto.PublicUserProfileResponse;
import com.tiwizi.user.profile.dto.UpdateUserProfileRequest;
import com.tiwizi.user.profile.dto.UserProfileResponse;
import com.tiwizi.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserProfileService {

    private final UserRepository userRepository;
    private final CampaignRepository campaignRepository;

    public UserProfileResponse getMyProfileByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return getResponse(user);
    }

    private UserProfileResponse getResponse(User user) {
        // Calculate user statistics
        List<Campaign> campaigns = campaignRepository.findByCreatorId(user.getId());
        int campaignsCreated = campaigns.size();
        long activeCampaigns = campaigns.stream()
                .filter(c -> c.getStatus() == CampaignStatus.ACTIVE)
                .count();

        int donationsMade = (int) user.getDonations().stream()
                .filter(d -> d.getStatus() == DonationStatus.SUCCESS)
                .count();

        int totalDonationsReceived = campaigns.stream()
                .mapToInt(Campaign::getDonationCount)
                .sum();

        return UserProfileResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .displayName(user.getDisplayName())
                .phoneNumber(user.getPhoneNumber())
                .profilePictureUrl(user.getProfilePictureUrl())
                .backgroundPictureUrl(user.getBackgroundPictureUrl())
                .bio(user.getBio())
                .isProfilePublic(user.getIsProfilePublic())
                .facebookUrl(user.getFacebookUrl())
                .twitterUrl(user.getTwitterUrl())
                .instagramUrl(user.getInstagramUrl())
                .linkedinUrl(user.getLinkedinUrl())
                .websiteUrl(user.getWebsiteUrl())
                .authProvider(user.getAuthProvider())
                .isEmailVerified(user.getIsEmailVerified())
                .googleLinked(user.getGoogleLinked())
                .createdAt(user.getCreatedAt())
                .lastLoginAt(user.getLastLoginAt())
                .isDonor(user.isDonor())
                .isBeneficiary(user.isBeneficiary())
                .isAdmin(user.isAdmin())
                .campaignsCreated(campaignsCreated)
                .activeCampaigns((int) activeCampaigns)
                .donationsMade(donationsMade)
                .totalDonationsReceived(totalDonationsReceived)
                .build();
    }

    @Transactional
    public UserProfileResponse updateMyProfileByEmail(UpdateUserProfileRequest request, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        // Update only provided fields
        // Email can only be changed by local (email/password) users
        if (request.getEmail() != null && AuthProvider.LOCAL.equals(user.getAuthProvider())) {
            user.setEmail(request.getEmail());
        }
        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }
        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }
        if (request.getDisplayName() != null) {
            user.setDisplayName(request.getDisplayName());
        }
        if (request.getPhoneNumber() != null) {
            user.setPhoneNumber(request.getPhoneNumber());
        }
        if (request.getProfilePictureUrl() != null) {
            user.setProfilePictureUrl(request.getProfilePictureUrl());
        }
        if (request.getBackgroundPictureUrl() != null) {
            user.setBackgroundPictureUrl(request.getBackgroundPictureUrl());
        }
        if (request.getBio() != null) {
            user.setBio(request.getBio());
        }
        if (request.getIsProfilePublic() != null) {
            user.setIsProfilePublic(request.getIsProfilePublic());
        }
        if (request.getFacebookUrl() != null) {
            user.setFacebookUrl(request.getFacebookUrl());
        }
        if (request.getTwitterUrl() != null) {
            user.setTwitterUrl(request.getTwitterUrl());
        }
        if (request.getInstagramUrl() != null) {
            user.setInstagramUrl(request.getInstagramUrl());
        }
        if (request.getLinkedinUrl() != null) {
            user.setLinkedinUrl(request.getLinkedinUrl());
        }
        if (request.getWebsiteUrl() != null) {
            user.setWebsiteUrl(request.getWebsiteUrl());
        }

        User updatedUser = userRepository.save(user);
        return getResponse(updatedUser);
    }

    public PublicUserProfileResponse getPublicProfile(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // Check if profile is public
        if (Boolean.FALSE.equals(user.getIsProfilePublic())) {
            // Return minimal public info for private profiles
            return PublicUserProfileResponse.builder()
                    .id(user.getId())
                    .displayName(user.getDisplayName() != null ? user.getDisplayName() : user.getFirstName())
                    .profilePictureUrl(user.getProfilePictureUrl())
                    .build();
        }

        // Calculate public statistics for public profiles
        List<Campaign> campaigns = campaignRepository.findByCreatorId(userId);
        int campaignsCreated = campaigns.size();
        long activeCampaigns = campaigns.stream()
                .filter(c -> c.getStatus() == CampaignStatus.ACTIVE)
                .count();

        int donationsMade = (int) user.getDonations().stream()
                .filter(d -> d.getStatus() == DonationStatus.SUCCESS)
                .count();

        String topSupportedCategory = user.getDonations().stream()
                .filter(d -> d.getStatus() == DonationStatus.SUCCESS && d.getCampaign() != null)
                .collect(Collectors.groupingBy(d -> d.getCampaign().getCategory().name(), Collectors.counting()))
                .entrySet().stream()
                .max(Comparator.comparingLong(Map.Entry::getValue))
                .map(Map.Entry::getKey)
                .orElse(null);

        return PublicUserProfileResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .firstName(user.getFirstName())
                .displayName(user.getDisplayName())
                .profilePictureUrl(user.getProfilePictureUrl())
                .backgroundPictureUrl(user.getBackgroundPictureUrl())
                .bio(user.getBio())
                .facebookUrl(user.getFacebookUrl())
                .twitterUrl(user.getTwitterUrl())
                .instagramUrl(user.getInstagramUrl())
                .linkedinUrl(user.getLinkedinUrl())
                .websiteUrl(user.getWebsiteUrl())
                .createdAt(user.getCreatedAt())
                .campaignsCreated(campaignsCreated)
                .activeCampaigns((int) activeCampaigns)
                .donationsMade(donationsMade)
                .topSupportedCategory(topSupportedCategory)
                .build();
    }
}