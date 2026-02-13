package com.tiwizi.auth.mapper;

import com.tiwizi.auth.dto.AuthTokenResponse;
import com.tiwizi.auth.dto.RegisterRequest;
import com.tiwizi.auth.service.JwtService;
import com.tiwizi.entity.User;
import com.tiwizi.enums.AuthProvider;
import com.tiwizi.enums.UserRole;
import com.tiwizi.user.dto.UserProfileResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Mapper for authentication-related conversions
 */
@Component
@RequiredArgsConstructor
public class AuthMapper {

    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    /**
     * Maps a RegisterRequest to a User entity
     */
    public User toUserEntity(RegisterRequest request) {
        return User.builder()
                .email(request.getEmail())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .fullName(request.getFirstName() + " " + request.getLastName())
                .password(passwordEncoder.encode(request.getPassword()))
                .authProvider(AuthProvider.LOCAL)
                .role(UserRole.USER)
                .isEmailVerified(false)
                .build();
    }

    /**
     * Maps a User entity to UserProfileResponse DTO
     */
    public UserProfileResponse toUserProfileResponse(User user) {
        return UserProfileResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .profilePictureUrl(user.getProfilePictureUrl())
                .role(user.getRole().name())
                .createdAt(user.getCreatedAt())
                .build();
    }

    /**
     * Generates AuthTokenResponse from UserDetails
     */
    public AuthTokenResponse toAuthTokenResponse(UserDetails userDetails) {
        return AuthTokenResponse.builder()
                .accessToken(jwtService.generateToken(userDetails))
                .refreshToken(jwtService.generateRefreshToken(userDetails))
                .build();
    }
}
