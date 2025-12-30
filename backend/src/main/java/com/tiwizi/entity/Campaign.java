package com.tiwizi.entity;

import com.tiwizi.enums.CampaignStatus;
import com.tiwizi.enums.UserRole;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "campaigns",
        indexes = {
                @Index(name = "idx_campaign_status", columnList = "status"),
                @Index(name = "idx_campaign_category", columnList = "category"),
                @Index(name = "idx_campaign_location", columnList = "location"),
                @Index(name = "idx_campaign_priority_score", columnList = "priority_score")
        })
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Campaign {

    @Id
    @Column(name = "id", length = 36, nullable = false)
    private String id;
    
    @NotBlank(message = "Title is required")
    @Size(min = 10, max = 200, message = "Title must be between 10 and 200 characters")
    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @NotBlank(message = "Description is required")
    @Size(min = 50, message = "Description must be at least 50 characters")
    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    private String description;

    @NotNull(message = "Goal amount is required")
    @DecimalMin(value = "100.0", message = "Goal amount must be at least 100 MAD")
    @Column(name = "goal_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal goalAmount;

    @Column(name = "amount_collected", nullable = false, precision = 10, scale = 2)
    private BigDecimal amountCollected = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private CampaignStatus status = CampaignStatus.PENDING;

    @NotNull(message = "Category is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false, length = 30)
    private UserRole.CampaignCategory category;

    @NotBlank(message = "Location is required")
    @Column(name = "location", nullable = false, length = 100)
    private String location;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "priority_score", precision = 10, scale = 2)
    private BigDecimal priorityScore = BigDecimal.ZERO;

    @Column(name = "trust_score", precision = 5, scale = 2)
    private BigDecimal trustScore = BigDecimal.ZERO;

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
    
    @NotNull(message = "Creator is required")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "creator_id", nullable = false)
    private User creator;

    @OneToMany(mappedBy = "campaign", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<CampaignDocument> documents = new HashSet<>();

    @OneToMany(mappedBy = "campaign", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<CampaignUpdate> updates = new HashSet<>();

    @OneToMany(mappedBy = "campaign", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Donation> donations = new HashSet<>();

    @OneToMany(mappedBy = "campaign", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Report> reports = new HashSet<>();
    
    public double getProgressPercentage() {
        if (goalAmount == null || goalAmount.compareTo(BigDecimal.ZERO) == 0) {
            return 0.0;
        }
        return amountCollected.divide(goalAmount, 4, BigDecimal.ROUND_HALF_UP)
                .multiply(new BigDecimal("100"))
                .doubleValue();
    }

    public boolean isFullyFunded() {
        return amountCollected.compareTo(goalAmount) >= 0;
    }
}