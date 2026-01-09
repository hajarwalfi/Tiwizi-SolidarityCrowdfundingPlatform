package com.tiwizi.controller;

import com.tiwizi.dto.*;
import com.tiwizi.service.OktaService;
import com.tiwizi.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller for authentication and user management endpoints
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final UserService userService;
    private final OktaService oktaService;

    /**
     * User login endpoint
     * Endpoint: POST /api/auth/login
     *
     * Authenticates user with Okta and returns access token
     *
     * @param loginRequest user credentials
     * @return ResponseEntity containing AuthResponse with access token
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        log.info("POST /api/auth/login - Login attempt for user: {}", loginRequest.getEmail());

        AuthResponse authResponse = oktaService.login(loginRequest);

        log.info("Login successful for user: {}", loginRequest.getEmail());

        return ResponseEntity.ok(authResponse);
    }

    /**
     * User registration endpoint
     * Endpoint: POST /api/auth/signup
     *
     * Creates new user account in Okta
     *
     * @param signupRequest user registration data
     * @return ResponseEntity with success message
     */
    @PostMapping("/signup")
    public ResponseEntity<MessageResponse> signup(@Valid @RequestBody SignupRequest signupRequest) {
        log.info("POST /api/auth/signup - Registration attempt for user: {}", signupRequest.getEmail());

        oktaService.signup(signupRequest);

        log.info("User registered successfully: {}", signupRequest.getEmail());

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(new MessageResponse("User registered successfully. Please login to continue."));
    }

    /**
     * Token refresh endpoint
     * Endpoint: POST /api/auth/refresh
     *
     * Refreshes access token using refresh token
     *
     * @param refreshRequest refresh token
     * @return ResponseEntity containing new AuthResponse
     */
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refreshToken(@Valid @RequestBody TokenRefreshRequest refreshRequest) {
        log.info("POST /api/auth/refresh - Refreshing access token");

        AuthResponse authResponse = oktaService.refreshToken(refreshRequest.getRefreshToken());

        log.info("Token refreshed successfully");

        return ResponseEntity.ok(authResponse);
    }

    /**
     * User logout endpoint
     * Endpoint: POST /api/auth/logout
     *
     * Revokes access token and logs out user
     *
     * @param jwt the Okta JWT token (automatically injected by Spring Security)
     * @return ResponseEntity with success message
     */
    @PostMapping("/logout")
    public ResponseEntity<MessageResponse> logout(@AuthenticationPrincipal Jwt jwt) {
        log.info("POST /api/auth/logout - Logout request for user: {}", jwt.getSubject());

        String token = jwt.getTokenValue();
        oktaService.revokeToken(token);

        log.info("User logged out successfully: {}", jwt.getSubject());

        return ResponseEntity.ok(new MessageResponse("Logged out successfully"));
    }

    /**
     * Get current authenticated user profile
     * Endpoint: GET /api/auth/me
     *
     * This endpoint extracts user information from the Okta JWT token
     * and returns the user profile. If the user doesn't exist in the local
     * database, it will be created automatically from JWT claims.
     *
     * @param jwt the Okta JWT token (automatically injected by Spring Security)
     * @return ResponseEntity containing UserProfileResponse
     */
    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getCurrentUser(
            @AuthenticationPrincipal Jwt jwt) {

        log.info("GET /api/auth/me - Fetching profile for user: {}", jwt.getSubject());

        UserProfileResponse userProfile = userService.getUserProfile(jwt);

        log.debug("User profile retrieved successfully for: {}", userProfile.getEmail());

        return ResponseEntity.ok(userProfile);
    }
}
