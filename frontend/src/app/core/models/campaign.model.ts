export enum CampaignCategory {
  HEALTH = 'HEALTH',
  EDUCATION = 'EDUCATION',
  HOUSING = 'HOUSING',
  FOOD = 'FOOD',
  EMERGENCY = 'EMERGENCY',
  ENVIRONMENT = 'ENVIRONMENT',
  COMMUNITY = 'COMMUNITY',
  DISABILITY = 'DISABILITY',
  CHILDREN = 'CHILDREN',
  CLOTHING = 'CLOTHING',
  OTHER = 'OTHER',
}

export enum CampaignStatus {
  PENDING = 'PENDING',
  REJECTED = 'REJECTED',
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED',
  ARCHIVED = 'ARCHIVED',
  COMPLETED = 'COMPLETED',
  SUSPENDED = 'SUSPENDED',
}

export interface CampaignDocument {
  id: string;
  documentType: string;
  fileUrl: string;
}

export interface CampaignUpdate {
  id: string;
  content: string;
  photoUrls?: string;
  createdAt: string;
}

export interface CampaignDonation {
  id: string;
  donorId?: string;
  donorName: string;
  donorProfilePicture?: string;
  amount: number;
  createdAt: string;
  isAnonymous: boolean;
}

export interface Campaign {
  id: string;
  title: string;
  description: string;
  goalAmount: number;
  amountCollected: number;
  status: CampaignStatus;
  category: CampaignCategory;
  location: string;
  rejectionReason?: string;
  deadline?: string;
  isUrgent: boolean;
  createdAt: string;
  updatedAt?: string;
  approvedAt?: string;
  closedAt?: string;
  deletedAt?: string;
  creatorId?: string;
  creatorName: string;
  creatorProfilePicture?: string;
  photoUrls?: string[];
  progressPercentage: number;
  donorCount?: number;
  documents?: CampaignDocument[];
  updates?: CampaignUpdate[];
  donations?: CampaignDonation[];
  ribNumber?: string;
  phone?: string;
  contactEmail?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  website?: string;
}

export interface CreateCampaignDto {
  title: string;
  description: string;
  goalAmount: number;
  category: CampaignCategory;
  location: string;
  isUrgent: boolean;
  deadline?: string;
}
