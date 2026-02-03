package com.tiwizi.enums;

/**
 * User role defines permission level, not behavior
 * - USER: Regular authenticated user (can donate AND create campaigns)
 * - ADMIN: Platform administrator
 *
 * Note: Whether someone is a "donor" or "beneficiary" is determined by their actions:
 * - Has donations? → They're a donor
 * - Has campaigns? → They're a beneficiary
 * - Can be both!
 */
public enum UserRole {
    USER,    // Regular user (can do everything: donate, create campaigns, etc.)
    ADMIN    // Platform administrator with extra permissions
}