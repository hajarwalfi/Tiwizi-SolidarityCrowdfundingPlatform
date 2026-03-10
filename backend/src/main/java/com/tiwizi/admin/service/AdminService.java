package com.tiwizi.admin.service;

import com.tiwizi.admin.dto.*;
import com.tiwizi.campaign.dto.CampaignResponse;
import com.tiwizi.campaign.mapper.CampaignMapper;
import com.tiwizi.campaign.repository.CampaignRepository;
import com.tiwizi.donation.dto.DonationResponse;
import com.tiwizi.donation.mapper.DonationMapper;
import com.tiwizi.donation.repository.DonationRepository;
import com.tiwizi.entity.Campaign;
import com.tiwizi.entity.Donation;
import com.tiwizi.entity.Report;
import com.tiwizi.entity.User;
import com.tiwizi.enums.CampaignStatus;
import com.tiwizi.exception.ResourceNotFoundException;
import com.tiwizi.notification.service.NotificationService;
import com.tiwizi.report.repository.ReportRepository;
import com.tiwizi.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tiwizi.enums.ReportStatus;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminService {

    private final CampaignRepository campaignRepository;
    private final UserRepository userRepository;
    private final DonationRepository donationRepository;
    private final ReportRepository reportRepository;
    private final CampaignMapper campaignMapper;
    private final DonationMapper donationMapper;
    private final NotificationService notificationService;

    /**
     * Get all pending campaigns for admin review
     */
    @Transactional(readOnly = true)
    public List<CampaignResponse> getPendingCampaigns() {
        log.info("Fetching pending campaigns for admin review");

        List<Campaign> pendingCampaigns = campaignRepository.findByStatus(CampaignStatus.PENDING);
        log.info("Found {} pending campaigns", pendingCampaigns.size());

        return pendingCampaigns.stream()
                .map(campaignMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Approve a campaign
     */
    @Transactional
    public CampaignResponse approveCampaign(String campaignId) {
        log.info("Approving campaign: {}", campaignId);

        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign not found with id: " + campaignId));

        if (campaign.getStatus() != CampaignStatus.PENDING) {
            throw new IllegalStateException("Only pending campaigns can be approved");
        }

        campaign.setStatus(CampaignStatus.ACTIVE);
        campaign.setApprovedAt(LocalDateTime.now());
        campaign.setRejectionReason(null);

        Campaign savedCampaign = campaignRepository.save(campaign);
        log.info("Campaign {} approved successfully", campaignId);

        // Send approval notification to beneficiary
        try {
            notificationService.sendCampaignApprovalNotification(campaign.getCreator(), savedCampaign);
        } catch (Exception e) {
            log.error("Failed to send approval notification", e);
        }

        return campaignMapper.toResponse(savedCampaign);
    }

    /**
     * Reject a campaign
     */
    @Transactional
    public CampaignResponse rejectCampaign(String campaignId, ReviewCampaignRequest request) {
        log.info("Rejecting campaign: {} with reason: {}", campaignId, request.getRejectionReason());

        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign not found with id: " + campaignId));

        if (campaign.getStatus() != CampaignStatus.PENDING) {
            throw new IllegalStateException("Only pending campaigns can be rejected");
        }

        campaign.setStatus(CampaignStatus.REJECTED);
        campaign.setRejectionReason(request.getRejectionReason());

        Campaign savedCampaign = campaignRepository.save(campaign);
        log.info("Campaign {} rejected successfully", campaignId);

        // Send rejection notification to beneficiary
        try {
            notificationService.sendCampaignRejectionNotification(campaign.getCreator(), savedCampaign);
        } catch (Exception e) {
            log.error("Failed to send rejection notification", e);
        }

        return campaignMapper.toResponse(savedCampaign);
    }

    /**
     * Get platform statistics
     */
    @Transactional(readOnly = true)
    public AdminStatsResponse getStatistics() {
        log.info("Fetching platform statistics");

        long totalCampaigns = campaignRepository.count();
        long pendingCampaigns = campaignRepository.findByStatus(CampaignStatus.PENDING).size();
        long activeCampaigns = campaignRepository.findByStatus(CampaignStatus.ACTIVE).size();
        long rejectedCampaigns = campaignRepository.findByStatus(CampaignStatus.REJECTED).size();
        long closedCampaigns = campaignRepository.findByStatus(CampaignStatus.CLOSED).size();

        long totalUsers = userRepository.count();
        long totalDonations = donationRepository.count();
        long totalReports = reportRepository.count();

        // Calculate total amount raised
        List<Donation> allDonations = donationRepository.findAll();
        BigDecimal totalAmountRaised = allDonations.stream()
                .map(Donation::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        AdminStatsResponse stats = AdminStatsResponse.builder()
                .totalCampaigns(totalCampaigns)
                .pendingCampaigns(pendingCampaigns)
                .approvedCampaigns(activeCampaigns)
                .rejectedCampaigns(rejectedCampaigns)
                .closedCampaigns(closedCampaigns)
                .totalUsers(totalUsers)
                .totalDonations(totalDonations)
                .totalAmountRaised(totalAmountRaised)
                .totalReports(totalReports)
                .build();

        log.info("Platform stats: {} total campaigns, {} pending, {} users, {} donations",
                totalCampaigns, pendingCampaigns, totalUsers, totalDonations);

        return stats;
    }

    /**
     * Get all campaigns with optional status filter
     */
    @Transactional(readOnly = true)
    public List<CampaignResponse> getAllCampaigns(String status) {
        log.info("Fetching all campaigns with status filter: {}", status);

        List<Campaign> campaigns;
        if (status != null && !status.isEmpty()) {
            try {
                CampaignStatus campaignStatus = CampaignStatus.valueOf(status.toUpperCase());
                campaigns = campaignRepository.findByStatus(campaignStatus);
            } catch (IllegalArgumentException e) {
                log.warn("Invalid status filter: {}, returning all campaigns", status);
                campaigns = campaignRepository.findAll();
            }
        } else {
            campaigns = campaignRepository.findAll();
        }

        log.info("Found {} campaigns", campaigns.size());
        return campaigns.stream()
                .map(campaignMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Suspend an active or pending campaign (e.g. due to reports)
     */
    @Transactional
    public CampaignResponse suspendCampaign(String campaignId, ReviewCampaignRequest request) {
        log.info("Suspending campaign: {} with reason: {}", campaignId, request.getRejectionReason());

        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign not found with id: " + campaignId));

        if (campaign.getStatus() != CampaignStatus.ACTIVE && campaign.getStatus() != CampaignStatus.PENDING) {
            throw new IllegalStateException("Only active or pending campaigns can be suspended");
        }

        campaign.setStatus(CampaignStatus.SUSPENDED);
        campaign.setRejectionReason(request.getRejectionReason());

        Campaign savedCampaign = campaignRepository.save(campaign);
        log.info("Campaign {} suspended successfully", campaignId);

        userRepository.findById(campaign.getCreator().getId()).ifPresentOrElse(
            creator -> {
                log.info("Sending suspension notification to creator: {}", creator.getEmail());
                try {
                    notificationService.sendCampaignSuspensionNotification(creator, savedCampaign);
                    log.info("Suspension notification sent successfully to {}", creator.getEmail());
                } catch (Exception e) {
                    log.error("Failed to send suspension notification for campaign {}", campaignId, e);
                }
            },
            () -> log.error("Creator not found for campaign {}, cannot send notification", campaignId)
        );

        return campaignMapper.toResponse(savedCampaign);
    }

    /**
     * Unsuspend a suspended campaign — restores it to ACTIVE
     */
    @Transactional
    public CampaignResponse unsuspendCampaign(String campaignId) {
        log.info("Unsuspending campaign: {}", campaignId);

        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign not found with id: " + campaignId));

        if (campaign.getStatus() != CampaignStatus.SUSPENDED) {
            throw new IllegalStateException("Only suspended campaigns can be unsuspended");
        }

        campaign.setStatus(CampaignStatus.ACTIVE);
        campaign.setRejectionReason(null);

        Campaign savedCampaign = campaignRepository.save(campaign);
        log.info("Campaign {} unsuspended successfully", campaignId);

        userRepository.findById(campaign.getCreator().getId()).ifPresentOrElse(
            creator -> {
                log.info("Sending unsuspension notification to creator: {}", creator.getEmail());
                try {
                    notificationService.sendCampaignUnsuspensionNotification(creator, savedCampaign);
                    log.info("Unsuspension notification sent successfully to {}", creator.getEmail());
                } catch (Exception e) {
                    log.error("Failed to send unsuspension notification for campaign {}", campaignId, e);
                }
            },
            () -> log.error("Creator not found for campaign {}, cannot send notification", campaignId)
        );

        return campaignMapper.toResponse(savedCampaign);
    }

    /**
     * Delete a fraudulent campaign
     */
    @Transactional
    public void deleteCampaign(String campaignId) {
        log.info("Deleting campaign: {}", campaignId);

        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign not found with id: " + campaignId));

        campaignRepository.delete(campaign);
        log.info("Campaign {} deleted successfully", campaignId);
    }

    /**
     * Get all users
     */
    @Transactional(readOnly = true)
    public List<UserAdminResponse> getAllUsers() {
        log.info("Fetching all users");

        List<User> users = userRepository.findAll();
        log.info("Found {} users", users.size());

        return users.stream()
                .map(user -> UserAdminResponse.builder()
                        .id(user.getId())
                        .email(user.getEmail())
                        .fullName(user.getFullName())
                        .firstName(user.getFirstName())
                        .lastName(user.getLastName())
                        .phoneNumber(user.getPhoneNumber())
                        .role(user.getRole())
                        .isEmailVerified(user.getIsEmailVerified())
                        .createdAt(user.getCreatedAt())
                        .lastLoginAt(user.getLastLoginAt())
                        .isDonor(user.isDonor())
                        .isBeneficiary(user.isBeneficiary())
                        .isAdmin(user.isAdmin())
                        .totalCampaigns(user.getCreatedCampaigns() != null ? user.getCreatedCampaigns().size() : 0)
                        .totalDonations(user.getDonations() != null ? user.getDonations().size() : 0)
                        .profilePictureUrl(user.getProfilePictureUrl())
                        .isBanned(user.getIsBanned())
                        .banReason(user.getBanReason())
                        .bannedAt(user.getBannedAt())
                        .build())
                .collect(Collectors.toList());
    }

    /**
     * Get detailed profile of a single user (campaigns + donations)
     */
    @Transactional(readOnly = true)
    public UserAdminDetailResponse getUserDetail(String userId) {
        log.info("Fetching detail for user: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        List<CampaignResponse> campaigns = campaignRepository.findByCreatorId(userId)
                .stream()
                .map(campaignMapper::toResponse)
                .collect(Collectors.toList());

        List<DonationResponse> donations = donationRepository.findByDonorId(userId)
                .stream()
                .map(donationMapper::toResponse)
                .collect(Collectors.toList());

        BigDecimal totalAmountDonated = donations.stream()
                .map(DonationResponse::getAmount)
                .filter(a -> a != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return UserAdminDetailResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phoneNumber(user.getPhoneNumber())
                .profilePictureUrl(user.getProfilePictureUrl())
                .role(user.getRole())
                .isEmailVerified(user.getIsEmailVerified())
                .isDonor(user.isDonor())
                .isBeneficiary(user.isBeneficiary())
                .isAdmin(user.isAdmin())
                .createdAt(user.getCreatedAt())
                .lastLoginAt(user.getLastLoginAt())
                .isBanned(user.getIsBanned())
                .banReason(user.getBanReason())
                .bannedAt(user.getBannedAt())
                .totalCampaigns(campaigns.size())
                .totalDonations(donations.size())
                .totalAmountDonated(totalAmountDonated)
                .campaigns(campaigns)
                .donations(donations)
                .build();
    }

    /**
     * Ban a user
     */
    @Transactional
    public void banUser(String userId, String reason) {
        log.info("Banning user: {} with reason: {}", userId, reason);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        user.setIsBanned(true);
        user.setBanReason(reason);
        user.setBannedAt(LocalDateTime.now());
        userRepository.save(user);

        notificationService.sendBanNotification(user, reason);
        log.info("User {} banned successfully for reason: {}", userId, reason);
    }

    /**
     * Unban a user
     */
    @Transactional
    public void unbanUser(String userId) {
        log.info("Unbanning user: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        user.setIsBanned(false);
        user.setBanReason(null);
        user.setBannedAt(null);
        userRepository.save(user);

        notificationService.sendUnbanNotification(user);
        log.info("User {} unbanned successfully", userId);
    }

    /**
     * Get all reports with optional status filter
     */
    @Transactional(readOnly = true)
    public List<ReportAdminResponse> getAllReports(String status) {
        log.info("Fetching all reports");

        List<Report> reports = reportRepository.findAll();
        log.info("Found {} reports", reports.size());

        return reports.stream()
                .map(report -> ReportAdminResponse.builder()
                        .id(report.getId())
                        .reportType(report.getReportType())
                        .campaignId(report.getCampaign() != null ? report.getCampaign().getId() : null)
                        .campaignTitle(report.getCampaign() != null ? report.getCampaign().getTitle() : null)
                        .reportedUserId(report.getReportedUser() != null ? report.getReportedUser().getId() : null)
                        .reportedUserName(report.getReportedUser() != null ? report.getReportedUser().getFullName() : null)
                        .reporterId(report.getReporter().getId())
                        .reporterEmail(report.getReporter().getEmail())
                        .reporterName(report.getReporter().getFullName() != null
                                ? report.getReporter().getFullName()
                                : report.getReporter().getEmail())
                        .reason(report.getReason())
                        .description(report.getDescription())
                        .status(report.getStatus())
                        .createdAt(report.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    /**
     * Get all admin activities (paginated, newest first)
     */
    @Transactional(readOnly = true)
    public PagedActivitiesResponse getActivities(int page, int size) {
        log.info("Fetching admin activities page={} size={}", page, size);
        List<AdminActivityResponse> activities = new ArrayList<>();

        // All pending campaigns
        campaignRepository.findByStatus(CampaignStatus.PENDING)
                .forEach(c -> activities.add(AdminActivityResponse.builder()
                        .id("campaign-" + c.getId())
                        .type("NEW_CAMPAIGN")
                        .title("New campaign to review")
                        .description("\"" + c.getTitle() + "\" — pending validation")
                        .createdAt(c.getCreatedAt())
                        .relatedEntityId(c.getId())
                        .build()));

        // All pending reports (campaign and user)
        reportRepository.findAll()
                .stream()
                .filter(r -> r.getStatus() == ReportStatus.PENDING)
                .forEach(r -> {
                    boolean isCampaignReport = r.getCampaign() != null;
                    String title = isCampaignReport ? "Campaign reported" : "User reported";
                    String description = isCampaignReport
                            ? "\"" + r.getCampaign().getTitle() + "\" has been reported"
                            : (r.getReportedUser() != null
                                ? (r.getReportedUser().getFullName() != null
                                    ? r.getReportedUser().getFullName()
                                    : r.getReportedUser().getEmail()) + " has been reported"
                                : "A user has been reported");
                    String relatedId = isCampaignReport
                            ? r.getCampaign().getId()
                            : (r.getReportedUser() != null ? r.getReportedUser().getId() : null);
                    activities.add(AdminActivityResponse.builder()
                            .id("report-" + r.getId())
                            .type("REPORT")
                            .title(title)
                            .description(description)
                            .createdAt(r.getCreatedAt())
                            .relatedEntityId(relatedId)
                            .build());
                });

        // All registered users
        userRepository.findAll()
                .forEach(u -> activities.add(AdminActivityResponse.builder()
                        .id("user-" + u.getId())
                        .type("NEW_USER")
                        .title("New user")
                        .description((u.getFullName() != null ? u.getFullName() : u.getEmail()) + " just registered")
                        .createdAt(u.getCreatedAt())
                        .relatedEntityId(u.getId())
                        .build()));

        // Active campaigns ≥90% funded (but not yet 100%)
        campaignRepository.findByStatus(CampaignStatus.ACTIVE)
                .stream()
                .filter(c -> c.getGoalAmount() != null && c.getAmountCollected() != null
                        && c.getGoalAmount().compareTo(BigDecimal.ZERO) > 0)
                .filter(c -> {
                    double progress = c.getAmountCollected()
                            .divide(c.getGoalAmount(), 4, RoundingMode.HALF_UP)
                            .doubleValue();
                    return progress >= 0.9 && progress < 1.0;
                })
                .forEach(c -> {
                    int pct = c.getAmountCollected()
                            .divide(c.getGoalAmount(), 4, RoundingMode.HALF_UP)
                            .multiply(BigDecimal.valueOf(100))
                            .intValue();
                    activities.add(AdminActivityResponse.builder()
                            .id("closing-" + c.getId())
                            .type("CAMPAIGN_CLOSING")
                            .title("Campaign near goal")
                            .description("\"" + c.getTitle() + "\" has reached " + pct + "% of its goal")
                            .createdAt(c.getCreatedAt())
                            .relatedEntityId(c.getId())
                            .build());
                });

        // Campaigns that reached 100%
        campaignRepository.findByStatus(CampaignStatus.ACTIVE)
                .stream()
                .filter(c -> c.getGoalAmount() != null && c.getAmountCollected() != null
                        && c.getAmountCollected().compareTo(c.getGoalAmount()) >= 0)
                .forEach(c -> activities.add(AdminActivityResponse.builder()
                        .id("funded-" + c.getId())
                        .type("CAMPAIGN_FUNDED")
                        .title("Goal reached!")
                        .description("\"" + c.getTitle() + "\" raised " + c.getAmountCollected().toPlainString() + " MAD")
                        .createdAt(c.getCreatedAt())
                        .relatedEntityId(c.getId())
                        .build()));

        List<AdminActivityResponse> sorted = activities.stream()
                .filter(a -> a.getCreatedAt() != null)
                .sorted(Comparator.comparing(AdminActivityResponse::getCreatedAt).reversed())
                .collect(Collectors.toList());

        long total = sorted.size();
        int totalPages = (int) Math.max(1, Math.ceil((double) total / size));
        int safePage = Math.max(0, Math.min(page, totalPages - 1));
        int from = safePage * size;
        int to = (int) Math.min(from + size, total);

        return PagedActivitiesResponse.builder()
                .items(sorted.subList(from, to))
                .total(total)
                .page(safePage)
                .size(size)
                .totalPages(totalPages)
                .build();
    }

    /**
     * Latest 20 activities for the dashboard mini-panel
     */
    @Transactional(readOnly = true)
    public List<AdminActivityResponse> getRecentActivities() {
        return getActivities(0, 20).getItems();
    }

    /**
     * Suspend a campaign from a report (campaign report action)
     */
    @Transactional
    public void suspendCampaignFromReport(String reportId, String reason) {
        log.info("Suspending campaign from report: {}", reportId);
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found with id: " + reportId));

        if (report.getCampaign() == null) {
            throw new IllegalStateException("This report is not linked to a campaign");
        }

        Campaign campaign = campaignRepository.findById(report.getCampaign().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Campaign not found"));

        campaign.setStatus(CampaignStatus.SUSPENDED);
        campaign.setRejectionReason(reason != null ? reason : "Suspended due to a report.");
        Campaign savedCampaign = campaignRepository.save(campaign);

        userRepository.findById(campaign.getCreator().getId()).ifPresent(creator -> {
            try {
                notificationService.sendCampaignSuspensionNotification(creator, savedCampaign);
            } catch (Exception e) {
                log.error("Failed to send suspension notification for campaign {}", campaign.getId(), e);
            }
        });

        report.setStatus(ReportStatus.RESOLVED);
        reportRepository.save(report);
        log.info("Campaign {} suspended and report {} resolved", campaign.getId(), reportId);
    }

    /**
     * Ban a user from a report (user report action)
     */
    @Transactional
    public void banUserFromReport(String reportId) {
        log.info("Banning user from report: {}", reportId);
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found with id: " + reportId));

        if (report.getReportedUser() == null) {
            throw new IllegalStateException("This report is not linked to a user");
        }

        User user = userRepository.findById(report.getReportedUser().getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String reason = report.getReason().name() + (report.getDescription() != null ? ": " + report.getDescription() : "");
        user.setIsBanned(true);
        user.setBanReason(reason);
        user.setBannedAt(LocalDateTime.now());
        userRepository.save(user);

        try {
            notificationService.sendBanNotification(user, reason);
        } catch (Exception e) {
            log.error("Failed to send ban notification for user {}", user.getId(), e);
        }

        report.setStatus(ReportStatus.RESOLVED);
        reportRepository.save(report);
        log.info("User {} banned and report {} resolved", user.getId(), reportId);
    }

    /**
     * Dismiss a report — no action taken
     */
    @Transactional
    public void dismissReport(String reportId) {
        log.info("Dismissing report: {}", reportId);
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found with id: " + reportId));
        report.setStatus(ReportStatus.REJECTED);
        reportRepository.save(report);
    }

    /**
     * Get all payment history
     */
    @Transactional(readOnly = true)
    public List<PaymentAdminResponse> getAllPayments() {
        log.info("Fetching all payment history");

        List<Donation> donations = donationRepository.findAll();
        log.info("Found {} donations", donations.size());

        return donations.stream()
                .map(donation -> PaymentAdminResponse.builder()
                        .id(donation.getId())
                        .campaignId(donation.getCampaign().getId())
                        .campaignTitle(donation.getCampaign().getTitle())
                        .donorId(donation.getDonor().getId())
                        .donorEmail(donation.getDonor().getEmail())
                        .donorName(donation.getDonor().getFullName() != null
                                ? donation.getDonor().getFullName()
                                : donation.getDonor().getEmail())
                        .amount(donation.getAmount())
                        .currency("MAD") // Default currency for Morocco
                        .status(donation.getStatus())
                        .paymentMethod(donation.getPaymentMethod())
                        .stripePaymentIntentId(donation.getPaymentTransactionId())
                        .createdAt(donation.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }
}
