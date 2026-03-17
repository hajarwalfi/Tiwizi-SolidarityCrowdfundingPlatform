export interface Donation {
  id: string;
  campaignId: string;
  campaignTitle: string;
  donorId: string;
  donorName: string;
  amount: number;
  status: DonationStatus;
  isAnonymous: boolean;
  createdAt: string;
  paidAt?: string;
  receiptUrl?: string;
}

export interface CreateDonationDto {
  campaignId: string;
  amount: number;
  isAnonymous: boolean;
  paymentMethod?: string;
}

export enum DonationStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}
