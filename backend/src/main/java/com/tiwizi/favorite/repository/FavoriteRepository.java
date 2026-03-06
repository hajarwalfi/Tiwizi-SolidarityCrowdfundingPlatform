package com.tiwizi.favorite.repository;

import com.tiwizi.favorite.entity.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, String> {

    List<Favorite> findByUserId(String userId);

    Optional<Favorite> findByUserIdAndCampaignId(String userId, String campaignId);

    boolean existsByUserIdAndCampaignId(String userId, String campaignId);

    void deleteByUserIdAndCampaignId(String userId, String campaignId);

    long countByCampaignId(String campaignId);
}
