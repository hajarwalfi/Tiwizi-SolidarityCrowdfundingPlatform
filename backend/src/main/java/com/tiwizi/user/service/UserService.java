package com.tiwizi.user.service;

import com.tiwizi.entity.User;
import com.tiwizi.enums.AuthProvider;
import com.tiwizi.enums.UserRole;
import com.tiwizi.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Service for user management operations
 * Centralizes user creation and update logic for cleaner authentication flows
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;

    /**
     * Process user from OAuth2/OIDC profile
     * Finds existing user by providerId or email, and updates or creates as needed
     */
    @Transactional
    public User processOAuthUser(String providerId, String email, String firstName, String lastName, String picture, AuthProvider provider) {
        log.info("Processing OAuth user - Provider: {}, Email: {}, ProviderId: {}", provider, email, providerId);

        // 1. Try to find by ProviderId
        Optional<User> existingUserByProvider = userRepository.findByProviderId(providerId);
        if (existingUserByProvider.isPresent()) {
            return updateExistingUser(existingUserByProvider.get(), email, firstName, lastName, picture, provider);
        }

        // 2. Try to find by Email (linking accounts)
        Optional<User> existingUserByEmail = userRepository.findByEmail(email);
        if (existingUserByEmail.isPresent()) {
            log.info("Linking existing account {} to providerId {}", email, providerId);
            User user = existingUserByEmail.get();
            user.setProviderId(providerId);
            return updateExistingUser(user, email, firstName, lastName, picture, provider);
        }

        // 3. Create new user
        return createNewOAuthUser(providerId, email, firstName, lastName, picture, provider);
    }

    private User updateExistingUser(User user, String email, String firstName, String lastName, String picture, AuthProvider provider) {
        log.info("Updating existing user: {}", email);
        user.setEmail(email);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setFullName(buildFullName(firstName, lastName));
        user.setProfilePictureUrl(picture);
        user.setAuthProvider(provider);
        setLinkedFlag(user, provider);
        user.setLastLoginAt(LocalDateTime.now());
        return userRepository.save(user);
    }

    private User createNewOAuthUser(String providerId, String email, String firstName, String lastName, String picture, AuthProvider provider) {
        log.info("Creating new OAuth user: {}", email);
        User user = User.builder()
                .providerId(providerId)
                .email(email)
                .firstName(firstName)
                .lastName(lastName)
                .fullName(buildFullName(firstName, lastName))
                .profilePictureUrl(picture)
                .role(UserRole.USER)
                .authProvider(provider)
                .googleLinked(provider == AuthProvider.GOOGLE)
                .isEmailVerified(true)
                .lastLoginAt(LocalDateTime.now())
                .build();
        return userRepository.save(user);
    }

    /**
     * Link an OAuth provider to an existing user account.
     * Sets the linked flag without changing the primary authProvider.
     */
    @Transactional
    public User linkOAuthAccount(String providerId, String email, String firstName, String lastName, String picture, AuthProvider provider) {
        log.info("Linking OAuth account - Provider: {}, Email: {}", provider, email);

        Optional<User> existingUser = userRepository.findByEmail(email);
        if (existingUser.isPresent()) {
            User user = existingUser.get();
            setLinkedFlag(user, provider);
            user.setLastLoginAt(LocalDateTime.now());
            return userRepository.save(user);
        }

        // If no user found, fall back to normal OAuth processing
        log.warn("No existing user found for linking with email: {}. Creating new user.", email);
        return createNewOAuthUser(providerId, email, firstName, lastName, picture, provider);
    }

    /**
     * Unlink an OAuth provider from a user account.
     */
    @Transactional
    public User unlinkOAuthAccount(String email, AuthProvider provider) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        if (provider == AuthProvider.GOOGLE) {
            user.setGoogleLinked(false);
        }

        return userRepository.save(user);
    }

    private void setLinkedFlag(User user, AuthProvider provider) {
        if (provider == AuthProvider.GOOGLE) {
            user.setGoogleLinked(true);
        }
    }

    private String buildFullName(String firstName, String lastName) {
        if (firstName == null) return lastName;
        if (lastName == null) return firstName;
        return firstName + " " + lastName;
    }
}
