package com.tiwizi.entity;

import com.tiwizi.enums.DonationStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "donations",
        indexes = {
                @Index(name = "idx_donation_status", columnList = "status"),
                @Index(name = "idx_donation_created_at", columnList = "created_at")
        })
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Donation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false)
    private String id;

    @NotNull(message = "Campaign is required")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "campaign_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Campaign campaign;

    @NotNull(message = "Donor is required")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "donor_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User donor;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "10.0", message = "Minimum donation amount is 10 MAD")
    @Column(name = "amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private DonationStatus status = DonationStatus.PENDING;

    @Column(name = "is_anonymous", nullable = false)
    private Boolean isAnonymous = false;

    @Column(name = "payment_method", length = 50)
    private String paymentMethod;

    @Column(name = "payment_transaction_id", length = 255)
    private String paymentTransactionId;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @Column(name = "receipt_url", length = 500)
    private String receiptUrl;
}