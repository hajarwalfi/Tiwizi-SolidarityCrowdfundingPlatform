package com.tiwizi.service;

import com.tiwizi.auth.service.JwtService;
import com.tiwizi.entity.User;
import com.tiwizi.enums.UserRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.*;

class JwtServiceTest {

    private JwtService jwtService;

    private static final String SECRET = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secretKey", SECRET);
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", 86400000L);
        ReflectionTestUtils.setField(jwtService, "refreshExpiration", 604800000L);
    }

    private User buildUser() {
        return User.builder()
                .id("user-1")
                .email("test@tiwizi.com")
                .role(UserRole.USER)
                .isBanned(false)
                .build();
    }

    @Test
    void generateToken_shouldCreateNonBlankToken() {
        String token = jwtService.generateToken(buildUser());
        assertThat(token).isNotBlank();
    }

    @Test
    void extractUsername_shouldReturnUserEmail() {
        User user = buildUser();
        String token = jwtService.generateToken(user);
        assertThat(jwtService.extractUsername(token)).isEqualTo("test@tiwizi.com");
    }

    @Test
    void isTokenValid_shouldReturnTrueForMatchingUser() {
        User user = buildUser();
        String token = jwtService.generateToken(user);
        assertThat(jwtService.isTokenValid(token, user)).isTrue();
    }

    @Test
    void isTokenValid_shouldReturnFalseForDifferentUser() {
        User user = buildUser();
        User otherUser = User.builder()
                .id("user-2")
                .email("other@tiwizi.com")
                .role(UserRole.USER)
                .isBanned(false)
                .build();
        String token = jwtService.generateToken(user);
        assertThat(jwtService.isTokenValid(token, otherUser)).isFalse();
    }

    @Test
    void generateRefreshToken_shouldBeDetectedAsRefreshToken() {
        User user = buildUser();
        String refreshToken = jwtService.generateRefreshToken(user);
        assertThat(jwtService.isRefreshToken(refreshToken)).isTrue();
    }

    @Test
    void isRefreshToken_shouldReturnFalseForAccessToken() {
        User user = buildUser();
        String accessToken = jwtService.generateToken(user);
        assertThat(jwtService.isRefreshToken(accessToken)).isFalse();
    }

    @Test
    void generateRefreshToken_shouldContainCorrectUsername() {
        User user = buildUser();
        String refreshToken = jwtService.generateRefreshToken(user);
        assertThat(jwtService.extractUsername(refreshToken)).isEqualTo("test@tiwizi.com");
    }
}
