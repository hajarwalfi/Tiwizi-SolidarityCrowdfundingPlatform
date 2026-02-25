package com.tiwizi.campaign.scheduler;

import com.tiwizi.campaign.repository.CampaignRepository;
import com.tiwizi.entity.Campaign;
import com.tiwizi.enums.CampaignStatus;
import com.tiwizi.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class CampaignScheduler {

    private final CampaignRepository campaignRepository;
    private final NotificationService notificationService;

    /**
     * Auto-close campaigns that have reached their goal
     * Runs every hour
     */
    @Scheduled(fixedRate = 3600000) // Every hour (3600000 ms)
    @Transactional
    public void autoCloseCampaigns() {
        log.info("Running auto-close campaigns job");

        try {
            // Find all active campaigns
            List<Campaign> approvedCampaigns = campaignRepository.findByStatus(CampaignStatus.ACTIVE);

            int closedCount = 0;

            for (Campaign campaign : approvedCampaigns) {
                // Check if campaign has reached or exceeded its goal
                if (campaign.isFullyFunded() && campaign.getClosedAt() == null) {
                    log.info("Auto-closing campaign {} - Goal reached: {} / {}",
                            campaign.getId(),
                            campaign.getAmountCollected(),
                            campaign.getGoalAmount());

                    campaign.setStatus(CampaignStatus.CLOSED);
                    campaign.setClosedAt(LocalDateTime.now());
                    campaignRepository.save(campaign);

                    closedCount++;

                    // Send notification to beneficiary
                    try {
                        notificationService.sendGoalReachedNotification(campaign.getCreator(), campaign);
                    } catch (Exception e) {
                        log.error("Failed to send goal reached notification for campaign {}", campaign.getId(), e);
                    }

                    log.info("Campaign {} successfully closed automatically", campaign.getId());
                }
            }

            if (closedCount > 0) {
                log.info("Auto-closed {} campaign(s) that reached their funding goal", closedCount);
            } else {
                log.debug("No campaigns to auto-close at this time");
            }

        } catch (Exception e) {
            log.error("Error during auto-close campaigns job", e);
        }
    }

    /**
     * Auto-mark campaigns as urgent when their deadline is within 7 days.
     * Runs every day at 8 AM.
     */
    @Scheduled(cron = "0 0 8 * * ?")
    @Transactional
    public void autoMarkDeadlineUrgent() {
        log.info("Running deadline urgency check");

        try {
            List<Campaign> activeCampaigns = campaignRepository.findByStatus(CampaignStatus.ACTIVE);
            LocalDate sevenDaysFromNow = LocalDate.now().plusDays(7);

            int count = 0;
            for (Campaign campaign : activeCampaigns) {
                if (campaign.getDeadline() != null
                        && !campaign.getIsUrgent()
                        && !campaign.getDeadline().isAfter(sevenDaysFromNow)) {
                    campaign.setIsUrgent(true);
                    campaignRepository.save(campaign);
                    count++;
                    log.info("Auto-marked campaign {} as urgent — deadline: {}", campaign.getId(), campaign.getDeadline());
                }
            }

            if (count > 0) {
                log.info("Auto-marked {} campaign(s) as urgent due to approaching deadline", count);
            }

        } catch (Exception e) {
            log.error("Error during deadline urgency check", e);
        }
    }
}
