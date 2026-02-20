package com.tiwizi.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for user profile response
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {

    private String id;
    private String email;
    private String fullName;
    private String firstName;
    private String lastName;
    private String profilePictureUrl;
    private String role;
    private LocalDateTime createdAt;
}
