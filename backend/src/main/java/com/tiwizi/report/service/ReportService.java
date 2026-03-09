package com.tiwizi.report.service;

import com.tiwizi.campaign.repository.CampaignRepository;
import com.tiwizi.entity.Campaign;
import com.tiwizi.entity.Report;
import com.tiwizi.entity.User;
import com.tiwizi.enums.ReportStatus;
import com.tiwizi.exception.InvalidOperationException;
import com.tiwizi.exception.ResourceNotFoundException;
import com.tiwizi.report.dto.CreateReportRequest;
import com.tiwizi.report.dto.CreateUserReportRequest;
import com.tiwizi.report.dto.ReportResponse;
import com.tiwizi.report.repository.ReportRepository;
import com.tiwizi.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportService {

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final CampaignRepository campaignRepository;

    /**
     * Create a new report for a campaign
     */
    @Transactional
    public ReportResponse createReport(String userId, String campaignId, CreateReportRequest request) {
        log.info("Creating report for campaign {} by user {}", campaignId, userId);

        // Check if user already reported this campaign
        if (reportRepository.existsByReporterIdAndCampaignId(userId, campaignId)) {
            throw new InvalidOperationException("You have already reported this campaign");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign not found with id: " + campaignId));

        Report report = new Report();
        report.setCampaign(campaign);
        report.setReporter(user);
        report.setReason(request.getReason());
        report.setDescription(request.getDescription());
        report.setStatus(ReportStatus.PENDING);

        Report savedReport = reportRepository.save(report);
        log.info("Report created with id: {}", savedReport.getId());

        return toResponse(savedReport);
    }

    /**
     * Create a report against a user
     */
    @Transactional
    public ReportResponse createUserReport(String reporterId, String reportedUserId, CreateUserReportRequest request) {
        log.info("Creating user report for user {} by reporter {}", reportedUserId, reporterId);

        if (reporterId.equals(reportedUserId)) {
            throw new InvalidOperationException("You cannot report yourself");
        }

        User reporter = userRepository.findById(reporterId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + reporterId));

        User reportedUser = userRepository.findById(reportedUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + reportedUserId));

        Report report = new Report();
        report.setReporter(reporter);
        report.setReportedUser(reportedUser);
        report.setReportType("USER");
        report.setReason(request.getReason());
        report.setDescription(request.getDescription());
        report.setStatus(ReportStatus.PENDING);

        Report savedReport = reportRepository.save(report);
        log.info("User report created with id: {}", savedReport.getId());

        return toResponse(savedReport);
    }

    /**
     * Get all reports created by a user
     */
    @Transactional(readOnly = true)
    public List<ReportResponse> getUserReports(String userId) {
        log.info("Fetching reports for user {}", userId);

        List<Report> reports = reportRepository.findByReporterId(userId);
        return reports.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get all reports for a campaign (admin only)
     */
    @Transactional(readOnly = true)
    public List<ReportResponse> getCampaignReports(String campaignId) {
        log.info("Fetching reports for campaign {}", campaignId);

        List<Report> reports = reportRepository.findByCampaignId(campaignId);
        return reports.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private ReportResponse toResponse(Report report) {
        return ReportResponse.builder()
                .id(report.getId())
                .reportType(report.getReportType())
                .campaignId(report.getCampaign() != null ? report.getCampaign().getId() : null)
                .campaignTitle(report.getCampaign() != null ? report.getCampaign().getTitle() : null)
                .reportedUserId(report.getReportedUser() != null ? report.getReportedUser().getId() : null)
                .reportedUserName(report.getReportedUser() != null ? report.getReportedUser().getFullName() : null)
                .reason(report.getReason())
                .description(report.getDescription())
                .status(report.getStatus())
                .createdAt(report.getCreatedAt())
                .build();
    }
}
