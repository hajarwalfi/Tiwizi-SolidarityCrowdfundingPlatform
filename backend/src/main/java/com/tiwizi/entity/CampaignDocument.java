package com.tiwizi.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "documents")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CampaignDocument {

    @Id
    @Column(name = "id", length = 36, nullable = false)
    private String id; // UUID from database

    @NotNull(message = "Campaign is required")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "campaign_id", nullable = false)
    private Campaign campaign;

    @NotBlank(message = "Document type is required")
    @Column(name = "document_type", nullable = false, length = 50)
    private String documentType; // PHOTO, MEDICAL_REPORT, ID_CARD, etc.

    @NotBlank(message = "File URL is required")
    @Column(name = "file_url", nullable = false, length = 500)
    private String fileUrl;

    @Column(name = "cloudinary_public_id", length = 255)
    private String cloudinaryPublicId;

    @CreationTimestamp
    @Column(name = "uploaded_at", nullable = false, updatable = false)
    private LocalDateTime uploadedAt;
}