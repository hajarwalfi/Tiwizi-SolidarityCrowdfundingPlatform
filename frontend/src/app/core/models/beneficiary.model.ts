import { CampaignCategory, CampaignStatus } from './campaign.model';

export interface BeneficiaryCampaignDocument {
  id: string;
  documentType: string;
  fileUrl: string;
}

export interface BeneficiaryCampaignResponse {
  id: string;
  title: string;
  description: string;
  goalAmount: number;
  amountCollected: number;
  status: CampaignStatus;
  category: CampaignCategory;
  location: string;
  progressPercentage: number;
  deadline?: string;
  isUrgent: boolean;
  createdAt: string;
  approvedAt?: string;
  donorCount: number;
  donationCount: number;
  updateCount: number;
  viewCount: number;
  rejectionReason?: string;
  ribNumber?: string;
  phone?: string;
  contactEmail?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  website?: string;
  photoUrls?: string[];
  documents?: BeneficiaryCampaignDocument[];
}

export interface BeneficiaryDashboardStats {
  totalCampaigns: number;
  activeCampaigns: number;
  pendingCampaigns: number;
  rejectedCampaigns: number;
  completedCampaigns: number;
  totalAmountRaised: number;
  totalGoalAmount: number;
  overallProgressPercentage: number;
  totalDonors: number;
  totalDonations: number;
  totalCampaignUpdates: number;
  recentDonationsCount: number;
  recentDonationsAmount: number;
}

export interface CampaignUpdateResponse {
  id: string;
  campaignId: string;
  content: string;
  photoUrls?: string;
  createdAt: string;
}

export interface CreateCampaignRequest {
  title: string;
  description: string;
  goalAmount: number;
  category: CampaignCategory;
  location: string;
  isUrgent: boolean;
  deadline?: string;
  ribNumber: string;
  phone?: string;
  contactEmail?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  website?: string;
}

export interface UpdateCampaignRequest {
  title: string;
  description: string;
  goalAmount: number;
  category: CampaignCategory;
  location: string;
  isUrgent: boolean;
  deadline?: string;
  ribNumber?: string;
  phone?: string;
  contactEmail?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  website?: string;
}

export interface CreateCampaignUpdateRequest {
  content: string;
  photoUrls?: string;
}
