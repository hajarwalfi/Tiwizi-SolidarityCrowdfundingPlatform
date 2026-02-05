package com.tiwizi.entity;

import com.tiwizi.enums.CampaignCategory;
import com.tiwizi.enums.CampaignStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.BatchSize;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "campaigns",
        indexes = {
                @Index(name = "idx_campaign_status", columnList = "status"),
                @Index(name = "idx_campaign_category", columnList = "category"),
                @Index(name = "idx_campaign_location", columnList = "location"),
                @Index(name = "idx_campaign_deadline", columnList = "deadline")
        })
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Campaign {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false)
    private String id;
    
    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "goal_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal goalAmount;

    @Column(name = "amount_collected", nullable = false, precision = 10, scale = 2)
    private BigDecimal amountCollected = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private CampaignStatus status = CampaignStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false, length = 30)
    private CampaignCategory category;

    @Column(name = "location", nullable = false, length = 100)
    private String location;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "phone", length = 30)
    private String phone;

    @Column(name = "contact_email", length = 255)
    private String contactEmail;

    @Column(name = "rib_number", length = 100)
    private String ribNumber;

    @Column(name = "facebook", length = 255)
    private String facebook;

    @Column(name = "instagram", length = 255)
    private String instagram;

    @Column(name = "twitter", length = 255)
    private String twitter;

    @Column(name = "website", length = 255)
    private String website;

    @Column(name = "deadline")
    private LocalDate deadline;

    @Column(name = "is_urgent", nullable = false)
    private Boolean isUrgent = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(name = "closed_at")
    private LocalDateTime closedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
    
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "creator_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User creator;

    @OneToMany(mappedBy = "campaign", cascade = CascadeType.ALL, orphanRemoval = true)
    @BatchSize(size = 50)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Set<CampaignDocument> documents = new HashSet<>();

    @OneToMany(mappedBy = "campaign", cascade = CascadeType.ALL, orphanRemoval = true)
    @BatchSize(size = 50)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Set<CampaignUpdate> updates = new HashSet<>();

    @OneToMany(mappedBy = "campaign", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Set<Donation> donations = new HashSet<>();

    @OneToMany(mappedBy = "campaign", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Set<Report> reports = new HashSet<>();
    
    public double getProgressPercentage() {
        if (goalAmount == null || goalAmount.compareTo(BigDecimal.ZERO) == 0) {
            return 0.0;
        }
        return amountCollected.divide(goalAmount, 4, RoundingMode.HALF_UP)
                .multiply(new BigDecimal("100"))
                .doubleValue();
    }

    public boolean isFullyFunded() {
        return amountCollected.compareTo(goalAmount) >= 0;
    }

    public int getDonorCount() {
        return (int) donations.stream()
                .filter(donation -> donation.getStatus() == com.tiwizi.enums.DonationStatus.SUCCESS)
                .map(donation -> donation.getDonor().getId())
                .distinct()
                .count();
    }

    public int getDonationCount() {
        return (int) donations.stream()
                .filter(donation -> donation.getStatus() == com.tiwizi.enums.DonationStatus.SUCCESS)
                .count();
    }

    public int getUpdateCount() {
        return updates.size();
    }
}