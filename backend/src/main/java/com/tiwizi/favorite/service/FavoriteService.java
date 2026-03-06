package com.tiwizi.favorite.service;

import com.tiwizi.campaign.mapper.CampaignMapper;
import com.tiwizi.campaign.repository.CampaignRepository;
import com.tiwizi.entity.Campaign;
import com.tiwizi.entity.User;
import com.tiwizi.exception.ResourceNotFoundException;
import com.tiwizi.favorite.dto.FavoriteResponse;
import com.tiwizi.favorite.entity.Favorite;
import com.tiwizi.favorite.repository.FavoriteRepository;
import com.tiwizi.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final UserRepository userRepository;
    private final CampaignRepository campaignRepository;
    private final CampaignMapper campaignMapper;

    /**
     * Add a campaign to user's favorites
     */
    @Transactional
    public FavoriteResponse addFavorite(String userId, String campaignId) {
        log.info("Adding campaign {} to favorites for user {}", campaignId, userId);

        // Check if already favorited
        if (favoriteRepository.existsByUserIdAndCampaignId(userId, campaignId)) {
            log.warn("Campaign {} is already in favorites for user {}", campaignId, userId);
            throw new IllegalStateException("Campaign is already in favorites");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign not found with id: " + campaignId));

        Favorite favorite = new Favorite();
        favorite.setUser(user);
        favorite.setCampaign(campaign);

        Favorite savedFavorite = favoriteRepository.save(favorite);
        log.info("Campaign {} added to favorites for user {}", campaignId, userId);

        return toResponse(savedFavorite);
    }

    /**
     * Remove a campaign from user's favorites
     */
    @Transactional
    public void removeFavorite(String userId, String campaignId) {
        log.info("Removing campaign {} from favorites for user {}", campaignId, userId);

        if (!favoriteRepository.existsByUserIdAndCampaignId(userId, campaignId)) {
            throw new ResourceNotFoundException("Favorite not found");
        }

        favoriteRepository.deleteByUserIdAndCampaignId(userId, campaignId);
        log.info("Campaign {} removed from favorites for user {}", campaignId, userId);
    }

    /**
     * Get all favorites for a user
     */
    @Transactional(readOnly = true)
    public List<FavoriteResponse> getUserFavorites(String userId) {
        log.info("Fetching favorites for user {}", userId);

        List<Favorite> favorites = favoriteRepository.findByUserId(userId);
        log.info("Found {} favorites for user {}", favorites.size(), userId);

        return favorites.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Check if a campaign is favorited by a user
     */
    @Transactional(readOnly = true)
    public boolean isFavorited(String userId, String campaignId) {
        return favoriteRepository.existsByUserIdAndCampaignId(userId, campaignId);
    }

    /**
     * Get favorite count for a campaign
     */
    @Transactional(readOnly = true)
    public long getFavoriteCount(String campaignId) {
        return favoriteRepository.countByCampaignId(campaignId);
    }

    private FavoriteResponse toResponse(Favorite favorite) {
        FavoriteResponse response = new FavoriteResponse();
        response.setId(favorite.getId());
        response.setCampaign(campaignMapper.toResponse(favorite.getCampaign()));
        response.setCreatedAt(favorite.getCreatedAt());
        return response;
    }
}
