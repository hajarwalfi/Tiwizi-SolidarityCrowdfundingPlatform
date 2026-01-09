package com.tiwizi.service;

import com.tiwizi.dto.UserProfileResponse;
import com.tiwizi.entity.User;
import com.tiwizi.mapper.UserMapper;
import com.tiwizi.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service for managing users
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    /**
     * Get or create user profile from Okta JWT token
     * If user doesn't exist in local database, create from JWT claims
     *
     * @param jwt the Okta JWT token
     * @return UserProfileResponse containing user information
     */
    @Transactional
    public UserProfileResponse getUserProfile(Jwt jwt) {
        String oktaId = jwt.getSubject();
        String email = jwt.getClaimAsString("email");

        log.debug("Getting user profile for Okta ID: {}", oktaId);

        // Find or create user
        User user = userRepository.findByOktaId(oktaId)
                .orElseGet(() -> {
                    log.info("User not found in database, creating new user from Okta claims for: {}", email);
                    return createUserFromJwt(jwt);
                });

        return userMapper.toUserProfileResponse(user);
    }

    /**
     * Sync user from JWT token to local database
     * Creates user if doesn't exist, updates if data has changed
     *
     * @param jwt the Okta JWT token
     * @return the synced User entity
     */
    @Transactional
    public User syncUserFromJwt(Jwt jwt) {
        String oktaId = jwt.getSubject();

        log.debug("Syncing user from JWT for Okta ID: {}", oktaId);

        return userRepository.findByOktaId(oktaId)
                .map(existingUser -> updateUserFromJwt(existingUser, jwt))
                .orElseGet(() -> createUserFromJwt(jwt));
    }

    /**
     * Create a new user from Okta JWT claims
     *
     * @param jwt the Okta JWT token
     * @return the created User entity
     */
    private User createUserFromJwt(Jwt jwt) {
        User user = userMapper.fromJwt(jwt);
        User savedUser = userRepository.save(user);
        log.info("Created new user with ID: {} for Okta ID: {}", savedUser.getId(), savedUser.getOktaId());
        return savedUser;
    }

    /**
     * Update existing user from JWT claims if data has changed
     *
     * @param user existing user entity
     * @param jwt the Okta JWT token
     * @return updated user entity
     */
    private User updateUserFromJwt(User user, Jwt jwt) {
        boolean hasChanges = userMapper.updateFromJwt(user, jwt);

        if (hasChanges) {
            user = userRepository.save(user);
            log.info("Updated user profile from JWT for: {}", user.getEmail());
        }

        return user;
    }
}
