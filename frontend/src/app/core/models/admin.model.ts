/**
 * Admin Module Models
 * TypeScript interfaces matching the backend admin DTOs
 */

import type { DonationStatus } from './donation.model';
import type { Campaign } from './campaign.model';
import type { Donation } from './donation.model';

// ===== User Administration =====
export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  role: 'USER' | 'ADMIN';
  isEmailVerified: boolean;
  createdAt: string;
  lastLoginAt?: string;
  isDonor: boolean;
  isBeneficiary: boolean;
  isAdmin: boolean;
  totalCampaigns: number;
  totalDonations: number;
  profilePictureUrl?: string;
  isBanned?: boolean;
  banReason?: string;
  bannedAt?: string;
}

export interface AdminUserDetail extends AdminUser {
  totalAmountDonated: number;
  campaigns: Campaign[];
  donations: Donation[];
}

// ===== Report Administration =====
export type ReportReason =
  | 'SPAM'
  | 'FRAUD'
  | 'INAPPROPRIATE'
  | 'DUPLICATE'
  | 'FALSE_INFO'
  | 'OTHER';

export type ReportStatus = 'PENDING' | 'REVIEWED' | 'RESOLVED' | 'REJECTED';

export interface AdminReport {
  id: string;
  reportType: 'CAMPAIGN' | 'USER';
  // Campaign report
  campaignId?: string;
  campaignTitle?: string;
  // User report
  reportedUserId?: string;
  reportedUserName?: string;
  // Common
  reporterId: string;
  reporterEmail: string;
  reporterName: string;
  reason: ReportReason;
  description: string;
  status: ReportStatus;
  createdAt: string;
}

// ===== Payment Administration =====
export interface AdminPayment {
  id: string;
  campaignId: string;
  campaignTitle: string;
  donorId: string;
  donorEmail: string;
  donorName: string;
  amount: number;
  currency: string;
  status: DonationStatus;
  paymentMethod: string;
  stripePaymentIntentId?: string;
  createdAt: string;
}

// ===== Request DTOs =====
export interface SuspendCampaignRequest {
  rejectionReason: string;
}
