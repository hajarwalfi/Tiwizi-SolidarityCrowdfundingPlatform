package com.tiwizi.repository;

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
     * Find user by Okta ID
     * @param oktaId the Okta user ID
     * @return Optional containing the user if found
     */
    Optional<User> findByOktaId(String oktaId);

    /**
     * Find user by email
     * @param email the user's email
     * @return Optional containing the user if found
     */
    Optional<User> findByEmail(String email);

    /**
     * Check if user exists by Okta ID
     * @param oktaId the Okta user ID
     * @return true if user exists, false otherwise
     */
    boolean existsByOktaId(String oktaId);

    /**
     * Check if user exists by email
     * @param email the user's email
     * @return true if user exists, false otherwise
     */
    boolean existsByEmail(String email);
}
