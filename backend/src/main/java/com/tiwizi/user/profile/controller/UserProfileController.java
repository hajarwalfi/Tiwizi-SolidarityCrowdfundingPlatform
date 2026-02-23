package com.tiwizi.user.profile.controller;

import com.tiwizi.auth.dto.ChangePasswordRequest;
import com.tiwizi.auth.service.JwtService;
import com.tiwizi.entity.User;
import com.tiwizi.enums.AuthProvider;
import com.tiwizi.user.profile.dto.PublicUserProfileResponse;
import com.tiwizi.user.profile.dto.UpdateUserProfileRequest;
import com.tiwizi.user.profile.dto.UserProfileResponse;
import com.tiwizi.user.profile.service.UserProfileService;
import com.tiwizi.user.repository.UserRepository;
import com.tiwizi.user.service.UserService;
import com.tiwizi.shared.service.CloudinaryService;
import com.tiwizi.common.dto.MessageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
@Slf4j
public class UserProfileController {

    private final UserProfileService userProfileService;
    private final CloudinaryService cloudinaryService;
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponse> getMyProfile(
            @AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails principal) {
        UserProfileResponse profile = userProfileService.getMyProfileByEmail(principal.getUsername());
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/profile")
    public ResponseEntity<UserProfileResponse> updateMyProfile(
            @Valid @RequestBody UpdateUserProfileRequest request,
            @AuthenticationPrincipal UserDetails principal) {
        String oldEmail = principal.getUsername();
        UserProfileResponse profile = userProfileService.updateMyProfileByEmail(request, oldEmail);

        // If email changed, generate a new JWT so the frontend stays authenticated
        if (!oldEmail.equals(profile.getEmail())) {
            UserDetails updatedUserDetails = userDetailsService.loadUserByUsername(profile.getEmail());
            String newToken = jwtService.generateToken(updatedUserDetails);
            return ResponseEntity.ok()
                    .header("X-New-Token", newToken)
                    .header(HttpHeaders.ACCESS_CONTROL_EXPOSE_HEADERS, "X-New-Token")
                    .body(profile);
        }

        return ResponseEntity.ok(profile);
    }

    @GetMapping("/profile/{userId}")
    public ResponseEntity<PublicUserProfileResponse> getPublicProfile(
            @PathVariable String userId) {
        PublicUserProfileResponse profile = userProfileService.getPublicProfile(userId);
        return ResponseEntity.ok(profile);
    }

    /**
     * Upload profile picture to Cloudinary and update user's profilePictureUrl
     */
    @PostMapping("/upload/profile-picture")
    public ResponseEntity<Map<String, String>> uploadProfilePicture(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails principal) throws IOException {

        // Validate file
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
        }
        if (file.getSize() > 5 * 1024 * 1024) { // 5MB limit
            return ResponseEntity.badRequest().body(Map.of("error", "File size must be less than 5MB"));
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Only image files are allowed"));
        }

        log.info("Uploading profile picture for user: {}", principal.getUsername());
        Map<String, Object> uploadResult = cloudinaryService.upload(file, "profile-pictures");
        String imageUrl = (String) uploadResult.get("secure_url");

        // Update the user's profile picture URL
        UpdateUserProfileRequest updateRequest = new UpdateUserProfileRequest();
        updateRequest.setProfilePictureUrl(imageUrl);
        userProfileService.updateMyProfileByEmail(updateRequest, principal.getUsername());

        log.info("Profile picture uploaded successfully: {}", imageUrl);
        return ResponseEntity.ok(Map.of("url", imageUrl));
    }

    /**
     * Upload background picture to Cloudinary and update user's backgroundPictureUrl
     */
    @PostMapping("/upload/background-picture")
    public ResponseEntity<Map<String, String>> uploadBackgroundPicture(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails principal) throws IOException {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
        }
        if (file.getSize() > 10 * 1024 * 1024) { // 10MB limit for background
            return ResponseEntity.badRequest().body(Map.of("error", "File size must be less than 10MB"));
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Only image files are allowed"));
        }

        log.info("Uploading background picture for user: {}", principal.getUsername());
        Map<String, Object> uploadResult = cloudinaryService.upload(file, "background-pictures");
        String imageUrl = (String) uploadResult.get("secure_url");

        UpdateUserProfileRequest updateRequest = new UpdateUserProfileRequest();
        updateRequest.setBackgroundPictureUrl(imageUrl);
        userProfileService.updateMyProfileByEmail(updateRequest, principal.getUsername());

        log.info("Background picture uploaded successfully: {}", imageUrl);
        return ResponseEntity.ok(Map.of("url", imageUrl));
    }

    /**
     * Change password for LOCAL auth users
     */
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            @AuthenticationPrincipal UserDetails principal) {
        String email = principal.getUsername();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        // Only LOCAL users can change password
        if (!AuthProvider.LOCAL.equals(user.getAuthProvider())) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Password change is not available for social login accounts"));
        }

        // Verify current password
        if (user.getPassword() == null || !passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new MessageResponse("Current password is incorrect"));
        }

        // Verify new password matches confirmation
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("New password and confirmation do not match"));
        }

        // Update password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        log.info("Password changed for user: {}", email);

        return ResponseEntity.ok(new MessageResponse("Password changed successfully"));
    }

    /**
     * Unlink a social provider from the user's account
     */
    @PostMapping("/unlink-account")
    public ResponseEntity<?> unlinkAccount(
            @RequestBody Map<String, String> request,
            @AuthenticationPrincipal UserDetails principal) {
        String email = principal.getUsername();
        String providerStr = request.get("provider");

        if (providerStr == null) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Provider is required"));
        }

        AuthProvider provider;
        try {
            provider = AuthProvider.valueOf(providerStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Invalid provider: " + providerStr));
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        // Cannot unlink the primary auth provider
        if (user.getAuthProvider() == provider) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Cannot unlink your primary authentication provider"));
        }

        userService.unlinkOAuthAccount(email, provider);
        log.info("Unlinked {} account for user: {}", provider, email);

        return ResponseEntity.ok(new MessageResponse("Account unlinked successfully"));
    }
}