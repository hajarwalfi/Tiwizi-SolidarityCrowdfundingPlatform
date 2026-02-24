package com.tiwizi.campaign.repository;

import com.tiwizi.entity.CampaignDocument;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CampaignDocumentRepository extends JpaRepository<CampaignDocument, String> {
}
