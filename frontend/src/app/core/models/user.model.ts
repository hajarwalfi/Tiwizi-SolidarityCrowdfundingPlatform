export interface UserProfileResponse {
  id: string;
  email: string;
  fullName: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  phoneNumber?: string;
  profilePictureUrl?: string;
  backgroundPictureUrl?: string;
  bio?: string;
  isProfilePublic: boolean;

  // Social links
  facebookUrl?: string;
  twitterUrl?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  websiteUrl?: string;

  authProvider: string;
  isEmailVerified: boolean;
  googleLinked: boolean;
  createdAt: string;
  lastLoginAt?: string;

  // Behavioral flags
  isDonor: boolean;
  isBeneficiary: boolean;
  isAdmin: boolean;

  // Statistics
  campaignsCreated: number;
  activeCampaigns: number;
  donationsMade: number;
  totalDonationsReceived: number;
}

export interface UpdateUserProfileRequest {
  email?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  phoneNumber?: string;
  profilePictureUrl?: string;
  backgroundPictureUrl?: string;
  bio?: string;
  isProfilePublic?: boolean;

  // Social links
  facebookUrl?: string;
  twitterUrl?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
}

export interface PublicUserProfileResponse {
  id: string;
  fullName: string;
  firstName?: string;
  displayName?: string;
  profilePictureUrl?: string;
  backgroundPictureUrl?: string;
  bio?: string;
  createdAt: string;

  // Social links (only if profile is public)
  facebookUrl?: string;
  twitterUrl?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  websiteUrl?: string;

  // Public statistics
  campaignsCreated: number;
  activeCampaigns: number;
  donationsMade: number;
  topSupportedCategory?: string;

  // Ban status
  isBanned?: boolean;
  banReason?: string;
}
