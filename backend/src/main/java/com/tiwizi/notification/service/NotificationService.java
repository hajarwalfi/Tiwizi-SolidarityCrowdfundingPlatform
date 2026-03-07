package com.tiwizi.notification.service;

import com.tiwizi.entity.Campaign;
import com.tiwizi.entity.Donation;
import com.tiwizi.entity.Notification;
import com.tiwizi.entity.User;
import com.tiwizi.enums.NotificationType;
import com.tiwizi.notification.dto.NotificationResponse;
import com.tiwizi.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Notification service — persists in-app notifications and logs them.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;

    // ── Query methods ────────────────────────────────────────

    public List<NotificationResponse> getUserNotifications(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<NotificationResponse> getUnreadNotifications(String userId) {
        return notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public long getUnreadCount(String userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public void markAsRead(String notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.setIsRead(true);
            n.setReadAt(LocalDateTime.now());
            notificationRepository.save(n);
        });
    }

    @Transactional
    public void markAllAsRead(String userId) {
        List<Notification> unread = notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        LocalDateTime now = LocalDateTime.now();
        unread.forEach(n -> {
            n.setIsRead(true);
            n.setReadAt(now);
        });
        notificationRepository.saveAll(unread);
    }

    @Transactional
    public void deleteAllNotifications(String userId) {
        notificationRepository.deleteByUserId(userId);
        log.info("🗑️ Deleted all notifications for user {}", userId);
    }

    // ── Event-triggered notifications ────────────────────────

    /**
     * Donor donated → notify the campaign beneficiary
     */
    public void sendDonationConfirmation(User donor, Campaign campaign, Donation donation) {
        // Notification for the DONOR (confirmation)
        createNotification(
                donor,
                NotificationType.DONATION_CONFIRMED,
                String.format("Your donation of %s MAD to the campaign \"%s\" has been confirmed. Thank you for your generosity!",
                        donation.getAmount(), campaign.getTitle()),
                campaign.getId()
        );
    }

    /**
     * New donation received → notify the campaign creator/beneficiary
     */
    public void sendNewDonationNotification(User beneficiary, Campaign campaign, Donation donation) {
        createNotification(
                beneficiary,
                NotificationType.DONATION_RECEIVED,
                String.format("Your campaign \"%s\" has received a new donation of %s MAD. Amount collected: %s/%s MAD.",
                        campaign.getTitle(), donation.getAmount(),
                        campaign.getAmountCollected(), campaign.getGoalAmount()),
                campaign.getId()
        );
    }

    /**
     * Campaign approved by admin
     */
    public void sendCampaignApprovalNotification(User beneficiary, Campaign campaign) {
        createNotification(
                beneficiary,
                NotificationType.CAMPAIGN_ACTIVE,
                String.format("Congratulations! Your campaign \"%s\" has been approved and is now visible to everyone.",
                        campaign.getTitle()),
                campaign.getId()
        );
    }

    /**
     * Campaign rejected by admin
     */
    public void sendCampaignRejectionNotification(User beneficiary, Campaign campaign) {
        createNotification(
                beneficiary,
                NotificationType.CAMPAIGN_REJECTED,
                String.format("Your campaign \"%s\" has been rejected. Reason: %s",
                        campaign.getTitle(),
                        campaign.getRejectionReason() != null ? campaign.getRejectionReason() : "Not specified"),
                campaign.getId()
        );
    }

    /**
     * Campaign reached its funding goal
     */
    public void sendGoalReachedNotification(User beneficiary, Campaign campaign) {
        createNotification(
                beneficiary,
                NotificationType.GOAL_REACHED,
                String.format("Incredible! Your campaign \"%s\" has reached its goal of %s MAD! The campaign has been automatically closed.",
                        campaign.getTitle(), campaign.getGoalAmount()),
                campaign.getId()
        );
    }

    /**
     * Campaign closed → notify all donors who supported it
     */
    public void sendCampaignClosedNotification(User donor, Campaign campaign) {
        createNotification(
                donor,
                NotificationType.CAMPAIGN_CLOSED,
                String.format("The campaign \"%s\" that you supported has been successfully closed. Thank you for your contribution!",
                        campaign.getTitle()),
                campaign.getId()
        );
    }

    /**
     * Campaign update posted → notify donors
     */
    public void sendCampaignUpdateNotification(User donor, Campaign campaign, String updateContent) {
        createNotification(
                donor,
                NotificationType.CAMPAIGN_UPDATE,
                String.format("New update for campaign \"%s\": %s",
                        campaign.getTitle(), updateContent),
                campaign.getId()
        );
    }

    /**
     * Campaign suspended by admin
     */
    public void sendCampaignSuspensionNotification(User beneficiary, Campaign campaign) {
        createNotification(
                beneficiary,
                NotificationType.CAMPAIGN_SUSPENDED,
                String.format("Your campaign \"%s\" has been suspended. Reason: %s",
                        campaign.getTitle(),
                        campaign.getRejectionReason() != null ? campaign.getRejectionReason() : "Not specified"),
                campaign.getId()
        );
    }

    /**
     * Campaign suspension lifted by admin
     */
    public void sendCampaignUnsuspensionNotification(User beneficiary, Campaign campaign) {
        createNotification(
                beneficiary,
                NotificationType.CAMPAIGN_UNSUSPENDED,
                String.format("The suspension on your campaign \"%s\" has been lifted. It is now active again.",
                        campaign.getTitle()),
                campaign.getId()
        );
    }

    /**
     * Account banned by admin
     */
    public void sendBanNotification(User user, String reason) {
        String message = reason != null && !reason.isBlank()
                ? "Your account has been suspended. Reason: " + reason
                : "Your account has been suspended by an administrator.";
        createNotification(user, NotificationType.ACCOUNT_BANNED, message, null);
    }

    /**
     * Account ban lifted by admin
     */
    public void sendUnbanNotification(User user) {
        createNotification(user, NotificationType.ACCOUNT_UNBANNED,
                "Your account suspension has been lifted. You can now access the platform again.", null);
    }

    // ── Internal helpers ─────────────────────────────────────

    private void createNotification(User user, NotificationType type, String message, String relatedEntityId) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setType(type.name());
        notification.setMessage(message);
        notification.setRelatedEntityId(relatedEntityId);
        notification.setIsRead(false);

        notificationRepository.save(notification);
        log.info("🔔 Notification [{}] → {} : {}", type, user.getEmail(), message);
    }

    private NotificationResponse toResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .type(n.getType())
                .message(n.getMessage())
                .relatedEntityId(n.getRelatedEntityId())
                .isRead(n.getIsRead())
                .createdAt(n.getCreatedAt())
                .readAt(n.getReadAt())
                .build();
    }
}
