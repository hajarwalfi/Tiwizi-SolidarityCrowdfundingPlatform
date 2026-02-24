package com.tiwizi.campaign.repository;

import com.tiwizi.entity.Campaign;
import com.tiwizi.enums.CampaignCategory;
import com.tiwizi.enums.CampaignStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CampaignRepository extends JpaRepository<Campaign, String> {

    List<Campaign> findByStatus(CampaignStatus status);
    List<Campaign> findByCreatorId(String creatorId);

    // Search and filter methods
    Page<Campaign> findByCategory(CampaignCategory category, Pageable pageable);
    Page<Campaign> findByLocationContainingIgnoreCase(String location, Pageable pageable);
    Page<Campaign> findByIsUrgent(Boolean isUrgent, Pageable pageable);

    @Query(value = "SELECT * FROM campaigns c WHERE " +
           "(:keyword IS NULL OR LOWER(c.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(CAST(c.description AS TEXT)) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:category IS NULL OR c.category = CAST(:category AS VARCHAR)) " +
           "AND (:status IS NULL OR c.status = CAST(:status AS VARCHAR)) " +
           "AND (:location IS NULL OR LOWER(c.location) LIKE LOWER(CONCAT('%', :location, '%'))) " +
           "AND (:isUrgent IS NULL OR c.is_urgent = :isUrgent) " +
           "AND (:deadlineSoon IS NULL OR (:deadlineSoon = TRUE AND c.deadline IS NOT NULL AND c.deadline >= CURRENT_DATE AND c.deadline <= CURRENT_DATE + INTERVAL '14 days')) " +
           "AND (:nearlyFunded IS NULL OR (:nearlyFunded = TRUE AND c.goal_amount > 0 AND c.amount_collected / c.goal_amount >= 0.75)) " +
           "ORDER BY c.is_urgent DESC, c.created_at ASC",
           countQuery = "SELECT COUNT(*) FROM campaigns c WHERE " +
           "(:keyword IS NULL OR LOWER(c.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(CAST(c.description AS TEXT)) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:category IS NULL OR c.category = CAST(:category AS VARCHAR)) " +
           "AND (:status IS NULL OR c.status = CAST(:status AS VARCHAR)) " +
           "AND (:location IS NULL OR LOWER(c.location) LIKE LOWER(CONCAT('%', :location, '%'))) " +
           "AND (:isUrgent IS NULL OR c.is_urgent = :isUrgent) " +
           "AND (:deadlineSoon IS NULL OR (:deadlineSoon = TRUE AND c.deadline IS NOT NULL AND c.deadline >= CURRENT_DATE AND c.deadline <= CURRENT_DATE + INTERVAL '14 days')) " +
           "AND (:nearlyFunded IS NULL OR (:nearlyFunded = TRUE AND c.goal_amount > 0 AND c.amount_collected / c.goal_amount >= 0.75))",
           nativeQuery = true)
    Page<Campaign> searchCampaigns(
            @Param("keyword") String keyword,
            @Param("category") String category,
            @Param("status") String status,
            @Param("location") String location,
            @Param("isUrgent") Boolean isUrgent,
            @Param("deadlineSoon") Boolean deadlineSoon,
            @Param("nearlyFunded") Boolean nearlyFunded,
            Pageable pageable
    );
}
