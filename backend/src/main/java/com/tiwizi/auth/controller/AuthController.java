package com.tiwizi.auth.controller;

import com.tiwizi.auth.dto.*;
import com.tiwizi.auth.mapper.AuthMapper;
import com.tiwizi.auth.service.AuthCodeService;
import com.tiwizi.auth.service.CustomUserDetailsService;
import com.tiwizi.auth.service.JwtService;
import com.tiwizi.common.dto.MessageResponse;
import com.tiwizi.entity.User;
import com.tiwizi.user.dto.UserProfileResponse;
import com.tiwizi.user.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final UserRepository userRepository;
    private final CustomUserDetailsService userDetailsService;
    private final AuthCodeService authCodeService;
    private final JwtService jwtService;
    private final AuthMapper authMapper;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            log.warn("Registration failed - email already exists: {}", request.getEmail());
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new MessageResponse("Email already in use"));
        }

        User user = authMapper.toUserEntity(request);
        userRepository.save(user);
        log.info("New user registered: {}", user.getEmail());

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        return ResponseEntity.status(HttpStatus.CREATED).body(authMapper.toAuthTokenResponse(userDetails));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);

        if (user == null || user.getPassword() == null ||
                !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            log.warn("Login failed for email: {}", request.getEmail());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new MessageResponse("Invalid email or password"));
        }

        user.setLastLoginAt(java.time.LocalDateTime.now());
        userRepository.save(user);
        log.info("User logged in: {}", user.getEmail());

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        return ResponseEntity.ok(authMapper.toAuthTokenResponse(userDetails));
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        log.info("GET /api/auth/me - user: {}", email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        return ResponseEntity.ok(authMapper.toUserProfileResponse(user));
    }

    @PostMapping("/exchange")
    public ResponseEntity<AuthTokenResponse> exchangeCode(@Valid @RequestBody CodeExchangeRequest request) {
        String email = authCodeService.exchangeCode(request.getCode());
        if (email == null) {
            log.warn("Invalid or expired authorization code");
            return ResponseEntity.status(401).build();
        }

        try {
            UserDetails userDetails = userDetailsService.loadUserByUsername(email);
            log.info("Code exchanged for user: {}", email);

            return ResponseEntity.ok(authMapper.toAuthTokenResponse(userDetails));
        } catch (Exception e) {
            log.error("Error exchanging code: {}", e.getMessage());
            return ResponseEntity.status(401).build();
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthTokenResponse> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        try {
            String username = jwtService.extractUsername(request.getRefreshToken());
            if (username == null) {
                return ResponseEntity.status(401).build();
            }

            UserDetails userDetails = userDetailsService.loadUserByUsername(username);
            if (!jwtService.isTokenValid(request.getRefreshToken(), userDetails) ||
                !jwtService.isRefreshToken(request.getRefreshToken())) {
                log.warn("Invalid refresh token for user: {}", username);
                return ResponseEntity.status(401).build();
            }

            log.info("Token refreshed for user: {}", username);
            return ResponseEntity.ok(authMapper.toAuthTokenResponse(userDetails));
        } catch (Exception e) {
            log.error("Error refreshing token: {}", e.getMessage());
            return ResponseEntity.status(401).build();
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<MessageResponse> logout(HttpServletRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        log.info("POST /api/auth/logout - user: {}", authentication != null ? authentication.getName() : "unknown");

        SecurityContextHolder.clearContext();
        var session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }

        return ResponseEntity.ok(new MessageResponse("Logged out successfully"));
    }
}
