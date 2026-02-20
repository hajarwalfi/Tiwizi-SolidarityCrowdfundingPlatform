package com.tiwizi.user.repository;

import com.tiwizi.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository interface for User entity
 */
@Repository
public interface UserRepository extends JpaRepository<User, String> {

    /**
     * Find user by Provider ID
     * @param providerId the OAuth2 provider user ID
     * @return Optional containing the user if found
     */
    Optional<User> findByProviderId(String providerId);

    /**
     * Find user by email
     * @param email the user's email
     * @return Optional containing the user if found
     */
    Optional<User> findByEmail(String email);

    /**
     * Check if user exists by Provider ID
     * @param providerId the OAuth2 provider user ID
     * @return true if user exists, false otherwise
     */
    boolean existsByProviderId(String providerId);

    /**
     * Check if user exists by email
     * @param email the user's email
     * @return true if user exists, false otherwise
     */
    boolean existsByEmail(String email);
}