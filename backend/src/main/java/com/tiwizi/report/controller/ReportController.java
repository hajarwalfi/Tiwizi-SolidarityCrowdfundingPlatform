package com.tiwizi.report.controller;

import com.tiwizi.exception.ResourceNotFoundException;
import com.tiwizi.report.dto.CreateReportRequest;
import com.tiwizi.report.dto.CreateUserReportRequest;
import com.tiwizi.report.dto.ReportResponse;
import com.tiwizi.report.service.ReportService;
import com.tiwizi.user.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Slf4j
public class ReportController {

    private final ReportService reportService;
    private final UserRepository userRepository;

    private String getUserIdFromPrincipal(Principal principal) {
        String email = principal.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email))
                .getId();
    }

    /**
     * Report a campaign
     */
    @PostMapping("/campaign/{campaignId}")
    public ResponseEntity<ReportResponse> reportCampaign(
            Principal principal,
            @PathVariable String campaignId,
            @Valid @RequestBody CreateReportRequest request) {
        String userId = getUserIdFromPrincipal(principal);
        log.info("POST /api/reports/campaign/{} - User {} reporting campaign", campaignId, userId);

        ReportResponse response = reportService.createReport(userId, campaignId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Report a user
     */
    @PostMapping("/user/{reportedUserId}")
    public ResponseEntity<ReportResponse> reportUser(
            Principal principal,
            @PathVariable String reportedUserId,
            @Valid @RequestBody CreateUserReportRequest request) {
        String userId = getUserIdFromPrincipal(principal);
        log.info("POST /api/reports/user/{} - User {} reporting user", reportedUserId, userId);
        ReportResponse response = reportService.createUserReport(userId, reportedUserId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Get my reports
     */
    @GetMapping("/my")
    public ResponseEntity<List<ReportResponse>> getMyReports(Principal principal) {
        String userId = getUserIdFromPrincipal(principal);
        log.info("GET /api/reports/my - Fetching reports for user {}", userId);

        List<ReportResponse> reports = reportService.getUserReports(userId);
        return ResponseEntity.ok(reports);
    }

    /**
     * Get reports for a campaign (admin only)
     */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/campaign/{campaignId}")
    public ResponseEntity<List<ReportResponse>> getCampaignReports(@PathVariable String campaignId) {
        log.info("GET /api/reports/campaign/{} - Fetching reports", campaignId);

        List<ReportResponse> reports = reportService.getCampaignReports(campaignId);
        return ResponseEntity.ok(reports);
    }
}
