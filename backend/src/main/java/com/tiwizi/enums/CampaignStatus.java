package com.tiwizi.enums;

/**
 * Campaign Status Lifecycle:
 *
 * PENDING → Created by beneficiary, awaiting admin review
 * ↓
 * ACTIVE → Approved by admin, accepting donations, beneficiary can post updates
 * ↓
 * CLOSED → Automatically closed when goal reached (by scheduler)
 * or COMPLETED → Manually completed by admin/beneficiary
 * or CANCELLED → Cancelled by beneficiary or admin
 *
 * Alternative paths:
 * PENDING → REJECTED → Campaign not approved by admin
 */
public enum CampaignStatus {
    PENDING,     // Awaiting admin review
    REJECTED,    // Not approved by admin
    ACTIVE,      // Live and accepting donations
    SUSPENDED,   // Temporarily suspended by admin (e.g. due to reports)
    CLOSED,      // Goal reached (auto-closed by system)
    CANCELLED,   // Cancelled by user or admin
    COMPLETED,   // Manually marked as complete
    ARCHIVED     // Hidden by beneficiary — no longer publicly visible
}