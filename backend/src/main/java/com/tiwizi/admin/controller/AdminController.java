package com.tiwizi.admin.controller;

import com.tiwizi.admin.dto.*;
import com.tiwizi.admin.service.AdminService;
import com.tiwizi.campaign.dto.CampaignResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Slf4j
public class AdminController {

    private final AdminService adminService;

    /**
     * Get all pending campaigns for review
     */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/campaigns/pending")
    public ResponseEntity<List<CampaignResponse>> getPendingCampaigns() {
        log.info("GET /api/admin/campaigns/pending - Fetching pending campaigns");
        return ResponseEntity.ok(adminService.getPendingCampaigns());
    }

    /**
     * Approve a campaign
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/campaigns/{id}/approve")
    public ResponseEntity<CampaignResponse> approveCampaign(@PathVariable String id) {
        log.info("PUT /api/admin/campaigns/{}/approve - Approving campaign", id);
        return ResponseEntity.ok(adminService.approveCampaign(id));
    }

    /**
     * Reject a campaign
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/campaigns/{id}/reject")
    public ResponseEntity<CampaignResponse> rejectCampaign(
            @PathVariable String id,
            @Valid @RequestBody ReviewCampaignRequest request) {
        log.info("PUT /api/admin/campaigns/{}/reject - Rejecting campaign", id);
        return ResponseEntity.ok(adminService.rejectCampaign(id, request));
    }

    /**
     * Get platform statistics
     */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/statistics")
    public ResponseEntity<AdminStatsResponse> getStatistics() {
        log.info("GET /api/admin/statistics - Fetching platform statistics");
        return ResponseEntity.ok(adminService.getStatistics());
    }

    /**
     * Get all campaigns (any status)
     */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/campaigns")
    public ResponseEntity<List<CampaignResponse>> getAllCampaigns(
            @RequestParam(required = false) String status) {
        log.info("GET /api/admin/campaigns - Fetching all campaigns with status: {}", status);
        return ResponseEntity.ok(adminService.getAllCampaigns(status));
    }

    /**
     * Suspend an active campaign
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/campaigns/{id}/suspend")
    public ResponseEntity<CampaignResponse> suspendCampaign(
            @PathVariable String id,
            @Valid @RequestBody ReviewCampaignRequest request) {
        log.info("PUT /api/admin/campaigns/{}/suspend - Suspending campaign", id);
        return ResponseEntity.ok(adminService.suspendCampaign(id, request));
    }

    /**
     * Unsuspend a suspended campaign
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/campaigns/{id}/unsuspend")
    public ResponseEntity<CampaignResponse> unsuspendCampaign(@PathVariable String id) {
        log.info("PUT /api/admin/campaigns/{}/unsuspend - Unsuspending campaign", id);
        return ResponseEntity.ok(adminService.unsuspendCampaign(id));
    }

    /**
     * Delete a fraudulent campaign
     */
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/campaigns/{id}")
    public ResponseEntity<Void> deleteCampaign(@PathVariable String id) {
        log.info("DELETE /api/admin/campaigns/{} - Deleting campaign", id);
        adminService.deleteCampaign(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Get all users
     */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/users")
    public ResponseEntity<List<UserAdminResponse>> getAllUsers() {
        log.info("GET /api/admin/users - Fetching all users");
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    /**
     * Get detailed profile of a single user
     */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/users/{id}")
    public ResponseEntity<UserAdminDetailResponse> getUserDetail(@PathVariable String id) {
        log.info("GET /api/admin/users/{} - Fetching user detail", id);
        return ResponseEntity.ok(adminService.getUserDetail(id));
    }

    /**
     * Ban a user
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/users/{id}/ban")
    public ResponseEntity<Void> banUser(
            @PathVariable String id,
            @RequestParam(required = false) String reason) {
        log.info("PUT /api/admin/users/{}/ban - Banning user", id);
        adminService.banUser(id, reason);
        return ResponseEntity.noContent().build();
    }

    /**
     * Unban a user
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/users/{id}/unban")
    public ResponseEntity<Void> unbanUser(@PathVariable String id) {
        log.info("PUT /api/admin/users/{}/unban - Unbanning user", id);
        adminService.unbanUser(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Get all reports
     */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/reports")
    public ResponseEntity<List<ReportAdminResponse>> getAllReports(
            @RequestParam(required = false) String status) {
        log.info("GET /api/admin/reports - Fetching all reports");
        return ResponseEntity.ok(adminService.getAllReports(status));
    }

    /**
     * Get recent admin activities for mini-panel (latest 20)
     */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/activities/recent")
    public ResponseEntity<List<AdminActivityResponse>> getRecentActivities() {
        log.info("GET /api/admin/activities/recent - Fetching recent activities");
        return ResponseEntity.ok(adminService.getRecentActivities());
    }

    /**
     * Get all admin activities paginated
     */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/activities")
    public ResponseEntity<PagedActivitiesResponse> getActivities(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        log.info("GET /api/admin/activities?page={}&size={}", page, size);
        return ResponseEntity.ok(adminService.getActivities(page, size));
    }

    /**
     * Suspend campaign from a report
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/reports/{id}/suspend-campaign")
    public ResponseEntity<Void> suspendCampaignFromReport(
            @PathVariable String id,
            @RequestParam(required = false) String reason) {
        log.info("PUT /api/admin/reports/{}/suspend-campaign", id);
        adminService.suspendCampaignFromReport(id, reason);
        return ResponseEntity.noContent().build();
    }

    /**
     * Ban user from a report
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/reports/{id}/ban-user")
    public ResponseEntity<Void> banUserFromReport(@PathVariable String id) {
        log.info("PUT /api/admin/reports/{}/ban-user", id);
        adminService.banUserFromReport(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Dismiss a report — no action taken
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/reports/{id}/dismiss")
    public ResponseEntity<Void> dismissReport(@PathVariable String id) {
        log.info("PUT /api/admin/reports/{}/dismiss", id);
        adminService.dismissReport(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Get all payment history
     */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/payments")
    public ResponseEntity<List<PaymentAdminResponse>> getAllPayments() {
        log.info("GET /api/admin/payments - Fetching payment history");
        return ResponseEntity.ok(adminService.getAllPayments());
    }
}
