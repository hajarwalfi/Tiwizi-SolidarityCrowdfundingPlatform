/**
 * Campaign Status Codes
 * These match the backend enum values
 */
export enum CampaignStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REJECTED = 'REJECTED',
}

/**
 * Status Display Labels
 * English translations for campaign statuses
 */
export const CAMPAIGN_STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Draft',
  PENDING: 'Pending',
  ACTIVE: 'Active',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  REJECTED: 'Rejected',
};

/**
 * Status Colors
 * Tailwind CSS color classes for each status
 */
export const CAMPAIGN_STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  ACTIVE: 'bg-green-100 text-green-800',
  COMPLETED: 'bg-blue-100 text-blue-800',
  CANCELLED: 'bg-red-100 text-red-800',
  REJECTED: 'bg-red-100 text-red-800',
};
