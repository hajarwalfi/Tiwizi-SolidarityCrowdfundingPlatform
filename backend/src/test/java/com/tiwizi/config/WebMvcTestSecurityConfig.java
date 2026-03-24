package com.tiwizi.config;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Shared test security configuration for @WebMvcTest slice tests.
 * Replaces the main SecurityConfig (which requires OAuth2/Cloudinary beans)
 * with a minimal config: CSRF disabled, public endpoints permitted.
 *
 * Usage: exclude SecurityConfig and import this class in each @WebMvcTest.
 */
@TestConfiguration
public class WebMvcTestSecurityConfig {

    @Bean
    public SecurityFilterChain testSecurityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/api/auth/register",
                    "/api/auth/login",
                    "/api/auth/refresh",
                    "/api/auth/exchange",
                    "/api/auth/logout",
                    "/api/campaigns",
                    "/api/campaigns/**"
                ).permitAll()
                .anyRequest().authenticated());
        return http.build();
    }
}
