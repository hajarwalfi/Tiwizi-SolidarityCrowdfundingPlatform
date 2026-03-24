package com.tiwizi.campaign.mapper;

import com.tiwizi.campaign.dto.CampaignDetailResponse;
import com.tiwizi.campaign.dto.CampaignResponse;
import com.tiwizi.entity.Campaign;
import com.tiwizi.entity.User;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper for converting Campaign entities to DTOs
 */
@Component
public class CampaignMapper {

    /**
     * Maps a Campaign entity to a CampaignResponse DTO
     */
    public CampaignResponse toResponse(Campaign campaign) {
        return CampaignResponse.builder()
                .id(campaign.getId())
                .title(campaign.getTitle())
                .description(campaign.getDescription())
                .goalAmount(campaign.getGoalAmount())
                .amountCollected(campaign.getAmountCollected())
                .status(campaign.getStatus())
                .category(campaign.getCategory())
                .location(campaign.getLocation())
                .deadline(campaign.getDeadline())
                .isUrgent(campaign.getIsUrgent())
                .creatorId(campaign.getCreator() != null ? campaign.getCreator().getId() : null)
                .creatorName(getUserName(campaign.getCreator()))
                .creatorProfilePicture(campaign.getCreator() != null ? campaign.getCreator().getProfilePictureUrl() : null)
                .createdAt(campaign.getCreatedAt())
                .progressPercentage(campaign.getProgressPercentage())
                .donorCount(campaign.getDonationCount())
                .photoUrls(campaign.getDocuments().stream()
                        .filter(doc -> "COVER_IMAGE".equalsIgnoreCase(doc.getDocumentType())
                                    || "CAMPAIGN_IMAGE".equalsIgnoreCase(doc.getDocumentType()))
                        .sorted((a, b) -> {
                            // COVER_IMAGE first
                            if ("COVER_IMAGE".equalsIgnoreCase(a.getDocumentType())) return -1;
                            if ("COVER_IMAGE".equalsIgnoreCase(b.getDocumentType())) return 1;
                            return 0;
                        })
                        .map(doc -> doc.getFileUrl())
                        .collect(Collectors.toList()))
                .build();
    }

    /**
     * Maps a Campaign entity to a detailed CampaignDetailResponse DTO
     */
    public CampaignDetailResponse toDetailResponse(Campaign campaign) {
        return CampaignDetailResponse.builder()
                .id(campaign.getId())
                .title(campaign.getTitle())
                .description(campaign.getDescription())
                .goalAmount(campaign.getGoalAmount())
                .amountCollected(campaign.getAmountCollected())
                .status(campaign.getStatus())
                .category(campaign.getCategory())
                .location(campaign.getLocation())
                .rejectionReason(campaign.getRejectionReason())
                .deadline(campaign.getDeadline())
                .isUrgent(campaign.getIsUrgent())
                .ribNumber(campaign.getRibNumber())
                .phone(campaign.getPhone())
                .contactEmail(campaign.getContactEmail())
                .facebook(campaign.getFacebook())
                .instagram(campaign.getInstagram())
                .twitter(campaign.getTwitter())
                .website(campaign.getWebsite())
                .creatorId(campaign.getCreator() != null ? campaign.getCreator().getId() : null)
                .creatorName(getUserName(campaign.getCreator()))
                .creatorProfilePicture(campaign.getCreator() != null ? campaign.getCreator().getProfilePictureUrl() : null)
                .createdAt(campaign.getCreatedAt())
                .progressPercentage(campaign.getProgressPercentage())
                .documents(campaign.getDocuments().stream()
                        .map(doc -> CampaignDetailResponse.DocumentResponse.builder()
                                .id(doc.getId())
                                .documentType(doc.getDocumentType())
                                .fileUrl(doc.getFileUrl())
                                .build())
                        .collect(Collectors.toList()))
                .updates(campaign.getUpdates().stream()
                        .map(update -> CampaignDetailResponse.UpdateResponse.builder()
                                .id(update.getId())
                                .content(update.getContent())
                                .photoUrls(update.getPhotoUrls())
                                .createdAt(update.getCreatedAt())
                                .build())
                        .collect(Collectors.toList()))
                .donations(campaign.getDonations().stream()
                        .map(donation -> CampaignDetailResponse.DonationResponse.builder()
                                .id(donation.getId())
                                .donorId(donation.getIsAnonymous() ? null : (donation.getDonor() != null ? donation.getDonor().getId() : null))
                                .donorName(donation.getIsAnonymous() ? "Anonymous Donor" : getUserName(donation.getDonor()))
                                .donorProfilePicture(donation.getIsAnonymous() ? null : (donation.getDonor() != null ? donation.getDonor().getProfilePictureUrl() : null))
                                .amount(donation.getAmount())
                                .createdAt(donation.getCreatedAt())
                                .isAnonymous(donation.getIsAnonymous())
                                .build())
                        .collect(Collectors.toList()))
                .build();
    }

    /**
     * Safely extracts the user's name
     */
    private String getUserName(User user) {
        if (user == null) {
            return "Unknown";
        }

        String fullName = user.getFullName();
        if (fullName != null && !fullName.isBlank()) {
            return fullName;
        }

        // Fallback to firstName + lastName
        String firstName = user.getFirstName();
        String lastName = user.getLastName();

        if (firstName != null && !firstName.isBlank() && lastName != null && !lastName.isBlank()) {
            return firstName + " " + lastName;
        }

        // Fallback to email
        return user.getEmail();
    }
}
