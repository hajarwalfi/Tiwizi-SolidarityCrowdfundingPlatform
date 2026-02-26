package com.tiwizi.beneficiary.mapper;

import com.tiwizi.beneficiary.dto.BeneficiaryCampaignResponse;
import com.tiwizi.beneficiary.dto.BeneficiaryCampaignResponse.DocumentResponse;
import com.tiwizi.beneficiary.dto.CampaignUpdateResponse;
import com.tiwizi.entity.Campaign;
import com.tiwizi.entity.CampaignUpdate;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class BeneficiaryMapper {

    public BeneficiaryCampaignResponse toResponse(Campaign campaign) {
        return BeneficiaryCampaignResponse.builder()
                .id(campaign.getId())
                .title(campaign.getTitle())
                .description(campaign.getDescription())
                .goalAmount(campaign.getGoalAmount())
                .amountCollected(campaign.getAmountCollected())
                .status(campaign.getStatus())
                .category(campaign.getCategory())
                .location(campaign.getLocation())
                .progressPercentage(campaign.getProgressPercentage())
                .deadline(campaign.getDeadline())
                .isUrgent(campaign.getIsUrgent())
                .createdAt(campaign.getCreatedAt())
                .approvedAt(campaign.getApprovedAt())
                .rejectionReason(campaign.getRejectionReason())
                .ribNumber(campaign.getRibNumber())
                .phone(campaign.getPhone())
                .contactEmail(campaign.getContactEmail())
                .facebook(campaign.getFacebook())
                .instagram(campaign.getInstagram())
                .twitter(campaign.getTwitter())
                .website(campaign.getWebsite())
                .donorCount(campaign.getDonorCount())
                .donationCount(campaign.getDonationCount())
                .updateCount(campaign.getUpdateCount())
                .viewCount(0) // TODO: implement view tracking
                .documents(campaign.getDocuments() != null
                        ? campaign.getDocuments().stream()
                                .map(d -> DocumentResponse.builder()
                                        .id(d.getId())
                                        .documentType(d.getDocumentType())
                                        .fileUrl(d.getFileUrl())
                                        .build())
                                .collect(Collectors.toList())
                        : List.of())
                .build();
    }

    public CampaignUpdateResponse toUpdateResponse(CampaignUpdate update) {
        return CampaignUpdateResponse.builder()
                .id(update.getId())
                .campaignId(update.getCampaign().getId())
                .content(update.getContent())
                .photoUrls(update.getPhotoUrls())
                .createdAt(update.getCreatedAt())
                .build();
    }
}