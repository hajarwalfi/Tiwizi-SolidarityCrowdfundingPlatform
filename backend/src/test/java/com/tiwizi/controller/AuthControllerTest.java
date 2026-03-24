package com.tiwizi.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tiwizi.auth.controller.AuthController;
import com.tiwizi.auth.dto.AuthTokenResponse;
import com.tiwizi.auth.dto.LoginRequest;
import com.tiwizi.auth.dto.RegisterRequest;
import com.tiwizi.auth.mapper.AuthMapper;
import com.tiwizi.auth.service.AuthCodeService;
import com.tiwizi.auth.service.CustomUserDetailsService;
import com.tiwizi.auth.service.JwtService;
import com.tiwizi.config.SecurityConfig;
import com.tiwizi.config.WebMvcTestSecurityConfig;
import com.tiwizi.entity.User;
import com.tiwizi.enums.UserRole;
import com.tiwizi.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(
        value = AuthController.class,
        excludeFilters = @ComponentScan.Filter(
                type = FilterType.ASSIGNABLE_TYPE,
                classes = SecurityConfig.class
        )
)
@Import(WebMvcTestSecurityConfig.class)
class AuthControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    @MockitoBean UserRepository userRepository;
    @MockitoBean CustomUserDetailsService userDetailsService;
    @MockitoBean AuthCodeService authCodeService;
    @MockitoBean JwtService jwtService;
    @MockitoBean AuthMapper authMapper;
    @MockitoBean PasswordEncoder passwordEncoder;

    private static final AuthTokenResponse MOCK_TOKENS = AuthTokenResponse.builder()
            .accessToken("test.access.token")
            .refreshToken("test.refresh.token")
            .build();

    private User buildUser(boolean banned) {
        return User.builder()
                .id("user-1")
                .email("user@tiwizi.com")
                .password("$2a$10$hashedpassword")
                .role(UserRole.USER)
                .isBanned(banned)
                .build();
    }

    @Test
    void register_shouldReturn201WithTokensForNewUser() throws Exception {
        RegisterRequest request = new RegisterRequest("Youssef", "Hajji", "new@tiwizi.com", "password123");

        when(userRepository.existsByEmail("new@tiwizi.com")).thenReturn(false);
        when(authMapper.toUserEntity(any())).thenReturn(buildUser(false));
        when(userDetailsService.loadUserByUsername(any())).thenReturn(buildUser(false));
        when(authMapper.toAuthTokenResponse(any())).thenReturn(MOCK_TOKENS);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.accessToken").value("test.access.token"))
                .andExpect(jsonPath("$.refreshToken").value("test.refresh.token"));
    }

    @Test
    void register_shouldReturn409WhenEmailAlreadyInUse() throws Exception {
        RegisterRequest request = new RegisterRequest("A", "B", "existing@tiwizi.com", "password123");

        when(userRepository.existsByEmail("existing@tiwizi.com")).thenReturn(true);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Email already in use"));
    }

    @Test
    void register_shouldReturn400WhenRequestIsInvalid() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void login_shouldReturn200WithTokensOnSuccess() throws Exception {
        LoginRequest request = new LoginRequest("user@tiwizi.com", "password123");
        User user = buildUser(false);

        when(userRepository.findByEmail("user@tiwizi.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password123", user.getPassword())).thenReturn(true);
        when(userDetailsService.loadUserByUsername(any())).thenReturn(user);
        when(authMapper.toAuthTokenResponse(any())).thenReturn(MOCK_TOKENS);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("test.access.token"));
    }

    @Test
    void login_shouldReturn401WhenUserNotFound() throws Exception {
        LoginRequest request = new LoginRequest("unknown@tiwizi.com", "password123");

        when(userRepository.findByEmail("unknown@tiwizi.com")).thenReturn(Optional.empty());

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void login_shouldReturn401WhenPasswordIsWrong() throws Exception {
        LoginRequest request = new LoginRequest("user@tiwizi.com", "wrongpass");
        User user = buildUser(false);

        when(userRepository.findByEmail("user@tiwizi.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrongpass", user.getPassword())).thenReturn(false);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void login_shouldReturn403WhenUserIsBanned() throws Exception {
        LoginRequest request = new LoginRequest("banned@tiwizi.com", "password123");
        User bannedUser = buildUser(true);
        bannedUser.setBanReason("Spam");

        when(userRepository.findByEmail("banned@tiwizi.com")).thenReturn(Optional.of(bannedUser));
        when(passwordEncoder.matches("password123", bannedUser.getPassword())).thenReturn(true);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("Your account has been banned. Reason: Spam"));
    }
}
