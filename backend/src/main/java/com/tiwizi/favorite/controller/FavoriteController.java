package com.tiwizi.favorite.controller;

import com.tiwizi.favorite.dto.FavoriteResponse;
import com.tiwizi.favorite.service.FavoriteService;
import com.tiwizi.user.repository.UserRepository;
import com.tiwizi.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
@Slf4j
public class FavoriteController {

    private final FavoriteService favoriteService;
    private final UserRepository userRepository;

    private String getUserIdFromPrincipal(Principal principal) {
        String email = principal.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email))
                .getId();
    }

    /**
     * Add a campaign to favorites
     */
    @PostMapping("/{campaignId}")
    public ResponseEntity<FavoriteResponse> addFavorite(
            Principal principal,
            @PathVariable String campaignId) {
        String userId = getUserIdFromPrincipal(principal);
        log.info("POST /api/favorites/{} - Adding to favorites for user {}", campaignId, userId);

        FavoriteResponse response = favoriteService.addFavorite(userId, campaignId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Remove a campaign from favorites
     */
    @DeleteMapping("/{campaignId}")
    public ResponseEntity<Void> removeFavorite(
            Principal principal,
            @PathVariable String campaignId) {
        String userId = getUserIdFromPrincipal(principal);
        log.info("DELETE /api/favorites/{} - Removing from favorites for user {}", campaignId, userId);

        favoriteService.removeFavorite(userId, campaignId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Get all favorites for the authenticated user
     */
    @GetMapping("/my")
    public ResponseEntity<List<FavoriteResponse>> getMyFavorites(Principal principal) {
        String userId = getUserIdFromPrincipal(principal);
        log.info("GET /api/favorites/my - Fetching favorites for user {}", userId);

        List<FavoriteResponse> favorites = favoriteService.getUserFavorites(userId);
        return ResponseEntity.ok(favorites);
    }

    /**
     * Check if a campaign is favorited by the authenticated user
     */
    @GetMapping("/check/{campaignId}")
    public ResponseEntity<Map<String, Boolean>> checkFavorite(
            Principal principal,
            @PathVariable String campaignId) {
        String userId = getUserIdFromPrincipal(principal);
        log.info("GET /api/favorites/check/{} - Checking favorite status for user {}", campaignId, userId);

        boolean isFavorited = favoriteService.isFavorited(userId, campaignId);
        return ResponseEntity.ok(Map.of("isFavorited", isFavorited));
    }

    /**
     * Get favorite count for a campaign
     */
    @GetMapping("/count/{campaignId}")
    public ResponseEntity<Map<String, Long>> getFavoriteCount(@PathVariable String campaignId) {
        log.info("GET /api/favorites/count/{} - Fetching favorite count", campaignId);

        long count = favoriteService.getFavoriteCount(campaignId);
        return ResponseEntity.ok(Map.of("count", count));
    }
}
