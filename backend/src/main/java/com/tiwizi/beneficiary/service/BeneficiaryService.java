package com.tiwizi.beneficiary.service;

import com.tiwizi.beneficiary.dto.*;
import com.tiwizi.beneficiary.mapper.BeneficiaryMapper;
import com.tiwizi.campaign.repository.CampaignDocumentRepository;
import com.tiwizi.campaign.repository.CampaignRepository;
import com.tiwizi.campaign.repository.CampaignUpdateRepository;
import com.tiwizi.entity.Campaign;
import com.tiwizi.entity.CampaignDocument;
import com.tiwizi.entity.CampaignUpdate;
import com.tiwizi.entity.User;
import com.tiwizi.enums.CampaignStatus;
import com.tiwizi.exception.InvalidOperationException;
import com.tiwizi.exception.ResourceNotFoundException;
import com.tiwizi.exception.UnauthorizedAccessException;
import com.tiwizi.shared.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BeneficiaryService {

    private final CampaignRepository campaignRepository;
    private final CampaignUpdateRepository campaignUpdateRepository;
    private final CampaignDocumentRepository campaignDocumentRepository;
    private final BeneficiaryMapper beneficiaryMapper;
    private final CloudinaryService cloudinaryService;

    public List<BeneficiaryCampaignResponse> getMyCampaigns(User currentUser) {
        List<Campaign> campaigns = campaignRepository.findByCreatorId(currentUser.getId());

        return campaigns.stream()
                .map(beneficiaryMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public BeneficiaryCampaignResponse createCampaign(CreateCampaignRequest request, User currentUser) {
        Campaign campaign = new Campaign();
        campaign.setTitle(request.getTitle());
        campaign.setDescription(request.getDescription());
        campaign.setGoalAmount(request.getGoalAmount());
        campaign.setCategory(request.getCategory());
        campaign.setLocation(request.getLocation());
        campaign.setIsUrgent(request.getIsUrgent() != null ? request.getIsUrgent() : false);
        campaign.setDeadline(request.getDeadline());
        campaign.setRibNumber(request.getRibNumber());
        campaign.setPhone(request.getPhone());
        campaign.setContactEmail(request.getContactEmail());
        campaign.setFacebook(request.getFacebook());
        campaign.setInstagram(request.getInstagram());
        campaign.setTwitter(request.getTwitter());
        campaign.setWebsite(request.getWebsite());
        campaign.setCreator(currentUser);
        campaign.setStatus(CampaignStatus.PENDING);
        campaign.setAmountCollected(BigDecimal.ZERO);

        Campaign savedCampaign = campaignRepository.save(campaign);
        return beneficiaryMapper.toResponse(savedCampaign);
    }

    @Transactional
    public BeneficiaryCampaignResponse updateCampaign(String campaignId, UpdateCampaignRequest request, User currentUser) {
        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign not found with id: " + campaignId));

        // Check if the campaign belongs to the current user
        if (!campaign.getCreator().getId().equals(currentUser.getId())) {
            throw new UnauthorizedAccessException("You are not authorized to update this campaign");
        }

        // Only allow updates for PENDING or REJECTED campaigns
        if (campaign.getStatus() != CampaignStatus.PENDING && campaign.getStatus() != CampaignStatus.REJECTED) {
            throw new InvalidOperationException("Cannot update campaign with status: " + campaign.getStatus());
        }

        // Update only provided fields
        if (request.getTitle() != null) {
            campaign.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            campaign.setDescription(request.getDescription());
        }
        if (request.getGoalAmount() != null) {
            campaign.setGoalAmount(request.getGoalAmount());
        }
        if (request.getCategory() != null) {
            campaign.setCategory(request.getCategory());
        }
        if (request.getLocation() != null) {
            campaign.setLocation(request.getLocation());
        }
        if (request.getIsUrgent() != null) {
            campaign.setIsUrgent(request.getIsUrgent());
        }
        if (request.getDeadline() != null) {
            campaign.setDeadline(request.getDeadline());
        }
        if (request.getRibNumber() != null) {
            campaign.setRibNumber(request.getRibNumber());
        }
        if (request.getPhone() != null) {
            campaign.setPhone(request.getPhone());
        }
        if (request.getContactEmail() != null) {
            campaign.setContactEmail(request.getContactEmail());
        }
        if (request.getFacebook() != null) {
            campaign.setFacebook(request.getFacebook());
        }
        if (request.getInstagram() != null) {
            campaign.setInstagram(request.getInstagram());
        }
        if (request.getTwitter() != null) {
            campaign.setTwitter(request.getTwitter());
        }
        if (request.getWebsite() != null) {
            campaign.setWebsite(request.getWebsite());
        }

        Campaign updatedCampaign = campaignRepository.save(campaign);
        return beneficiaryMapper.toResponse(updatedCampaign);
    }

    public BeneficiaryDashboardStatsResponse getDashboardStats(User currentUser) {
        List<Campaign> campaigns = campaignRepository.findByCreatorId(currentUser.getId());

        // Count campaigns by status
        int totalCampaigns = campaigns.size();
        long activeCampaigns = campaigns.stream()
                .filter(c -> c.getStatus() == CampaignStatus.ACTIVE)
                .count();
        long pendingCampaigns = campaigns.stream()
                .filter(c -> c.getStatus() == CampaignStatus.PENDING)
                .count();
        long rejectedCampaigns = campaigns.stream()
                .filter(c -> c.getStatus() == CampaignStatus.REJECTED)
                .count();
        long completedCampaigns = campaigns.stream()
                .filter(c -> c.getStatus() == CampaignStatus.COMPLETED)
                .count();

        // Calculate financial stats
        BigDecimal totalAmountRaised = campaigns.stream()
                .map(Campaign::getAmountCollected)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalGoalAmount = campaigns.stream()
                .map(Campaign::getGoalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        double overallProgressPercentage = 0.0;
        if (totalGoalAmount.compareTo(BigDecimal.ZERO) > 0) {
            overallProgressPercentage = totalAmountRaised
                    .divide(totalGoalAmount, 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100"))
                    .doubleValue();
        }

        // Calculate engagement stats
        int totalDonors = (int) campaigns.stream()
                .flatMap(c -> c.getDonations().stream())
                .map(d -> d.getDonor().getId())
                .distinct()
                .count();

        int totalDonations = campaigns.stream()
                .mapToInt(c -> c.getDonations().size())
                .sum();

        int totalCampaignUpdates = campaigns.stream()
                .mapToInt(Campaign::getUpdateCount)
                .sum();

        // Recent activity (last 7 days)
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);

        int recentDonationsCount = (int) campaigns.stream()
                .flatMap(c -> c.getDonations().stream())
                .filter(d -> d.getCreatedAt().isAfter(sevenDaysAgo))
                .count();

        BigDecimal recentDonationsAmount = campaigns.stream()
                .flatMap(c -> c.getDonations().stream())
                .filter(d -> d.getCreatedAt().isAfter(sevenDaysAgo))
                .map(d -> d.getAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return BeneficiaryDashboardStatsResponse.builder()
                .totalCampaigns(totalCampaigns)
                .activeCampaigns((int) activeCampaigns)
                .pendingCampaigns((int) pendingCampaigns)
                .rejectedCampaigns((int) rejectedCampaigns)
                .completedCampaigns((int) completedCampaigns)
                .totalAmountRaised(totalAmountRaised)
                .totalGoalAmount(totalGoalAmount)
                .overallProgressPercentage(overallProgressPercentage)
                .totalDonors(totalDonors)
                .totalDonations(totalDonations)
                .totalCampaignUpdates(totalCampaignUpdates)
                .recentDonationsCount(recentDonationsCount)
                .recentDonationsAmount(recentDonationsAmount)
                .build();
    }

    @Transactional
    public void deleteCampaign(String campaignId, User currentUser) {
        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign not found with id: " + campaignId));

        if (!campaign.getCreator().getId().equals(currentUser.getId())) {
            throw new UnauthorizedAccessException("You are not authorized to delete this campaign");
        }

        if (campaign.getStatus() != CampaignStatus.PENDING && campaign.getStatus() != CampaignStatus.REJECTED) {
            throw new InvalidOperationException("Can only delete campaigns with PENDING or REJECTED status");
        }

        campaignRepository.delete(campaign);
    }

    @Transactional
    public BeneficiaryCampaignResponse archiveCampaign(String campaignId, User currentUser) {
        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign not found with id: " + campaignId));

        if (!campaign.getCreator().getId().equals(currentUser.getId())) {
            throw new UnauthorizedAccessException("You are not authorized to archive this campaign");
        }

        if (campaign.getStatus() == CampaignStatus.PENDING
                || campaign.getStatus() == CampaignStatus.REJECTED
                || campaign.getStatus() == CampaignStatus.ARCHIVED) {
            throw new InvalidOperationException("Cannot archive a campaign with status: " + campaign.getStatus());
        }

        campaign.setStatus(CampaignStatus.ARCHIVED);
        Campaign saved = campaignRepository.save(campaign);
        return beneficiaryMapper.toResponse(saved);
    }

    @Transactional
    public BeneficiaryCampaignResponse unarchiveCampaign(String campaignId, User currentUser) {
        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign not found with id: " + campaignId));

        if (!campaign.getCreator().getId().equals(currentUser.getId())) {
            throw new UnauthorizedAccessException("You are not authorized to unarchive this campaign");
        }

        if (campaign.getStatus() != CampaignStatus.ARCHIVED) {
            throw new InvalidOperationException("Campaign is not archived");
        }

        campaign.setStatus(CampaignStatus.CLOSED);
        Campaign saved = campaignRepository.save(campaign);
        return beneficiaryMapper.toResponse(saved);
    }

    // Campaign Updates Management

    @Transactional
    public CampaignUpdateResponse createCampaignUpdate(String campaignId, CreateCampaignUpdateRequest request, User currentUser) {
        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign not found with id: " + campaignId));

        // Check if the campaign belongs to the current user
        if (!campaign.getCreator().getId().equals(currentUser.getId())) {
            throw new UnauthorizedAccessException("You are not authorized to update this campaign");
        }

        // Allow updates for ACTIVE and CLOSED campaigns
        if (campaign.getStatus() != CampaignStatus.ACTIVE && campaign.getStatus() != CampaignStatus.CLOSED) {
            throw new InvalidOperationException("Can only post updates for ACTIVE or CLOSED campaigns");
        }

        CampaignUpdate update = new CampaignUpdate();
        update.setCampaign(campaign);
        update.setContent(request.getContent());
        update.setPhotoUrls(request.getPhotoUrls());

        CampaignUpdate savedUpdate = campaignUpdateRepository.save(update);
        return beneficiaryMapper.toUpdateResponse(savedUpdate);
    }

    public List<CampaignUpdateResponse> getCampaignUpdates(String campaignId, User currentUser) {
        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign not found with id: " + campaignId));

        // Check if the campaign belongs to the current user
        if (!campaign.getCreator().getId().equals(currentUser.getId())) {
            throw new UnauthorizedAccessException("You are not authorized to view these updates");
        }

        List<CampaignUpdate> updates = campaignUpdateRepository.findByCampaignIdOrderByCreatedAtDesc(campaignId);
        return updates.stream()
                .map(beneficiaryMapper::toUpdateResponse)
                .collect(Collectors.toList());
    }

    public String uploadUpdateImage(MultipartFile file, User currentUser) {
        try {
            Map<String, Object> result = cloudinaryService.upload(file, "campaign-updates");
            return (String) result.get("secure_url");
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload image to Cloudinary", e);
        }
    }

    @Transactional
    public void deleteCampaignUpdate(String campaignId, String updateId, User currentUser) {
        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign not found with id: " + campaignId));

        // Check if the campaign belongs to the current user
        if (!campaign.getCreator().getId().equals(currentUser.getId())) {
            throw new UnauthorizedAccessException("You are not authorized to delete this update");
        }

        CampaignUpdate update = campaignUpdateRepository.findById(updateId)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign update not found with id: " + updateId));

        // Verify the update belongs to the campaign
        if (!update.getCampaign().getId().equals(campaignId)) {
            throw new InvalidOperationException("This update does not belong to the specified campaign");
        }

        campaignUpdateRepository.delete(update);
    }

    @Transactional
    public BeneficiaryCampaignResponse.DocumentResponse uploadCampaignDocument(
            String campaignId, MultipartFile file, String documentType, User currentUser) {
        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign not found with id: " + campaignId));
        if (!campaign.getCreator().getId().equals(currentUser.getId())) {
            throw new UnauthorizedAccessException("You are not authorized to upload documents for this campaign");
        }
        try {
            Map<String, Object> result = cloudinaryService.upload(file, "campaigns/" + campaignId + "/" + documentType.toLowerCase());
            CampaignDocument doc = new CampaignDocument();
            doc.setCampaign(campaign);
            doc.setDocumentType(documentType);
            doc.setFileUrl((String) result.get("secure_url"));
            doc.setCloudinaryPublicId((String) result.get("public_id"));
            CampaignDocument saved = campaignDocumentRepository.save(doc);
            return BeneficiaryCampaignResponse.DocumentResponse.builder()
                    .id(saved.getId())
                    .documentType(saved.getDocumentType())
                    .fileUrl(saved.getFileUrl())
                    .build();
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload document to Cloudinary", e);
        }
    }

    @Transactional
    public void deleteCampaignDocument(String campaignId, String documentId, User currentUser) {
        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign not found with id: " + campaignId));
        if (!campaign.getCreator().getId().equals(currentUser.getId())) {
            throw new UnauthorizedAccessException("You are not authorized to delete documents for this campaign");
        }
        CampaignDocument doc = campaignDocumentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + documentId));
        if (doc.getCloudinaryPublicId() != null) {
            try { cloudinaryService.delete(doc.getCloudinaryPublicId()); } catch (IOException ignored) {}
        }
        campaignDocumentRepository.delete(doc);
    }
}