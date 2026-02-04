package com.tiwizi.entity;

import com.tiwizi.enums.AuthProvider;
import com.tiwizi.enums.UserRole;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false)
    private String id;

    @Column(name = "provider_id", unique = true, length = 255)
    private String providerId;

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    @Column(name = "email", unique = true, nullable = false, length = 255)
    private String email;

    @Column(name = "full_name", length = 255)
    private String fullName;

    @Column(name = "first_name", length = 100)
    private String firstName;

    @Column(name = "last_name", length = 100)
    private String lastName;

    @Column(name = "phone_number", length = 20)
    private String phoneNumber;

    @Column(name = "profile_picture_url", length = 500)
    private String profilePictureUrl;

    @Column(name = "background_picture_url", length = 500)
    private String backgroundPictureUrl;

    @Column(name = "display_name", length = 100)
    private String displayName;

    @Column(name = "bio", length = 500)
    private String bio;

    @Column(name = "is_profile_public", nullable = false)
    @Builder.Default
    private Boolean isProfilePublic = true;

    @Column(name = "facebook_url", length = 255)
    private String facebookUrl;

    @Column(name = "twitter_url", length = 255)
    private String twitterUrl;

    @Column(name = "instagram_url", length = 255)
    private String instagramUrl;

    @Column(name = "linkedin_url", length = 255)
    private String linkedinUrl;

    @Column(name = "website_url", length = 255)
    private String websiteUrl;

    @Column(name = "password", length = 255)
    private String password;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 20)
    private UserRole role = UserRole.USER;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "auth_provider", nullable = false, length = 20)
    private AuthProvider authProvider = AuthProvider.LOCAL;

    @Column(name = "is_email_verified", nullable = false)
    @Builder.Default
    private Boolean isEmailVerified = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    @Column(name = "is_banned", nullable = false)
    @Builder.Default
    private Boolean isBanned = false;

    @Column(name = "ban_reason", length = 500)
    private String banReason;

    @Column(name = "stripe_customer_id", unique = true, length = 255)
    private String stripeCustomerId;

    @Column(name = "google_linked", nullable = false)
    @Builder.Default
    private Boolean googleLinked = false;

    @Column(name = "banned_at")
    private LocalDateTime bannedAt;

    // Relationships
    @OneToMany(mappedBy = "creator", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Set<Campaign> createdCampaigns = new HashSet<>();

    @OneToMany(mappedBy = "donor", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Set<Donation> donations = new HashSet<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Set<Notification> notifications = new HashSet<>();

    // UserDetails Implementation
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return isBanned == null || !isBanned;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    // Helper methods to determine user behavior based on actions
    public boolean isDonor() {
        return donations != null && donations.stream()
                .anyMatch(d -> d.getStatus() == com.tiwizi.enums.DonationStatus.SUCCESS);
    }

    public boolean isBeneficiary() {
        return createdCampaigns != null && !createdCampaigns.isEmpty();
    }

    public boolean isAdmin() {
        return role == UserRole.ADMIN;
    }
}