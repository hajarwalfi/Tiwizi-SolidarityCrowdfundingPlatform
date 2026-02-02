package com.tiwizi.enums;

/**
 * Status of a report
 */
public enum ReportStatus {
    PENDING,    // Awaiting admin review
    REVIEWED,   // Admin has reviewed the report
    RESOLVED,   // Action taken, issue resolved
    REJECTED    // Report rejected (not a valid concern)
}
