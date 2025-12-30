package com.tiwizi.enums;

public enum UserRole {
    VISITOR,
    DONOR,
    BENEFICIARY,
    ADMIN;

    public enum CampaignCategory {
        SANTE,
        EDUCATION,
        LOGEMENT,
        ALIMENTATION,
        URGENCE,
        AUTRE
    }
}