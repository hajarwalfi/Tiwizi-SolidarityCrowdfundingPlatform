package com.tiwizi.user.profile.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserProfileRequest {

    @Email(message = "Invalid email format")
    @Size(max = 255, message = "Email must not exceed 255 characters")
    private String email;

    @Size(max = 255, message = "Full name must not exceed 255 characters")
    private String fullName;

    @Size(max = 100, message = "First name must not exceed 100 characters")
    private String firstName;

    @Size(max = 100, message = "Last name must not exceed 100 characters")
    private String lastName;

    @Size(max = 100, message = "Display name must not exceed 100 characters")
    private String displayName;

    @Size(max = 20, message = "Phone number must not exceed 20 characters")
    private String phoneNumber;

    @Size(max = 500, message = "Profile picture URL must not exceed 500 characters")
    private String profilePictureUrl;

    @Size(max = 500, message = "Background picture URL must not exceed 500 characters")
    private String backgroundPictureUrl;

    @Size(max = 500, message = "Bio must not exceed 500 characters")
    private String bio;

    private Boolean isProfilePublic;

    // Social links with URL validation
    @Size(max = 255, message = "Facebook URL must not exceed 255 characters")
    @Pattern(regexp = "^$|^(https?://)?([a-zA-Z0-9-]+\\.)*(facebook|fb)\\.com(/.*)?$",
             message = "Invalid Facebook URL format")
    private String facebookUrl;

    @Size(max = 255, message = "Twitter URL must not exceed 255 characters")
    @Pattern(regexp = "^$|^(https?://)?([a-zA-Z0-9-]+\\.)*(twitter|x)\\.com(/.*)?$",
             message = "Invalid Twitter/X URL format")
    private String twitterUrl;

    @Size(max = 255, message = "Instagram URL must not exceed 255 characters")
    @Pattern(regexp = "^$|^(https?://)?([a-zA-Z0-9-]+\\.)*instagram\\.com(/.*)?$",
             message = "Invalid Instagram URL format")
    private String instagramUrl;

    @Size(max = 255, message = "LinkedIn URL must not exceed 255 characters")
    @Pattern(regexp = "^$|^(https?://)?([a-zA-Z0-9-]+\\.)*linkedin\\.com(/.*)?$",
             message = "Invalid LinkedIn URL format")
    private String linkedinUrl;

    @Size(max = 255, message = "Website URL must not exceed 255 characters")
    @Pattern(regexp = "^$|^(https?://)?[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}(/.*)?$",
             message = "Invalid website URL format")
    private String websiteUrl;
}