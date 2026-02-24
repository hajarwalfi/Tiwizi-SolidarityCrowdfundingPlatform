package com.tiwizi.campaign.repository;

import com.tiwizi.entity.CampaignUpdate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CampaignUpdateRepository extends JpaRepository<CampaignUpdate, String> {
    List<CampaignUpdate> findByCampaignIdOrderByCreatedAtDesc(String campaignId);
}