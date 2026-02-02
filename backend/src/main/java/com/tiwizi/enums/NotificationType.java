package com.tiwizi.enums;

public enum NotificationType {
    DONATION_RECEIVED,       // Beneficiary: someone donated to your campaign
    DONATION_CONFIRMED,      // Donor: your donation was confirmed
    CAMPAIGN_ACTIVE,         // Beneficiary: your campaign was approved and is now active
    CAMPAIGN_REJECTED,       // Beneficiary: your campaign was rejected by admin
    CAMPAIGN_CLOSED,         // Donor: a campaign you supported has been closed/completed
    GOAL_REACHED,            // Beneficiary: your campaign reached its goal
    CAMPAIGN_UPDATE,         // Donor: a campaign you supported posted an update
    CAMPAIGN_SUSPENDED,      // Beneficiary: your campaign has been suspended by an admin
    CAMPAIGN_UNSUSPENDED,    // Beneficiary: your campaign suspension has been lifted
    ACCOUNT_BANNED,          // User: your account has been banned by an admin
    ACCOUNT_UNBANNED         // User: your account ban has been lifted
}
